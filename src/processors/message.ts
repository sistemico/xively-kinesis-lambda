import * as Bluebird from 'bluebird';

import db from 'database';
import { data, reports } from 'database/models';
import { ProcessorContext } from 'processors/core';

export default function messageProcessor(message: string, ctx: ProcessorContext) {
  ctx.logger.info({ message }, 'Start processing message');

  const { deviceId, organizationId: groupId } = ctx.props;

  return db.connect()
    .then(async (client) => {
      try {
        await client.query('BEGIN');

        ctx.logger.debug('Saving report log to DB');

        const { rows: [{ id: reportId }] } = await client.query(
          reports.insert({
            timestamp: ctx.props.timestamp.toISOString(),
            payload: message,
            deviceId: ctx.props.deviceId,
            groupId: ctx.props.organizationId,
            context: ctx.props,
          }),
        );

        await Bluebird.map(message.split('\n'), (report) => {
          const [timestamp, key, value] = report.split(',');

          ctx.logger.debug({ telemetry: { timestamp, key, value } }, `Saving '${key}' value to DB`);

          return client.query(
            data.insert({
              timestamp, key, value,
              deviceId, groupId,
              reportId,
            }),
          );
        });

        await client.query('COMMIT');
      } catch (e) {
        await client.query('ROLLBACK');
        throw e;
      } finally {
        client.release();
      }
    })
    .tap(() => {
      ctx.logger.info('Message successfully processed');
    });
}

