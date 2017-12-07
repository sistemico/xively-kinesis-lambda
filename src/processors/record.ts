import * as Promise from 'bluebird';
import { Logger } from 'pino';

import { ProcessorContext } from 'processors/core';
import messageProcessor from 'processors/message';

import { XivelyKinesisEnvelope } from 'lib/kinesis/envelope';

export default function recordProcessor(record: KinesisRecord, rootLogger: Logger) {
  // Creates a log group specific to this record
  let logger = rootLogger.child({ eventId: record.eventID });

  return Promise.resolve(record)
    .then((record: KinesisRecord) => {
      // TODO: logger.info({ record }, 'Processing record');

      // Takes kinesis event and returns JS object from decoded binary kinesis data
      return new XivelyKinesisEnvelope(record.kinesis.data);
    })
    .then((envelope: XivelyKinesisEnvelope) => {
      const { sourceName: sourceId, contentBody: data } = envelope;
      const { channel, deviceId, organizationId, templateId } = envelope.target;

      // Event timestamp assumed equal to the approximate time that the record was inserted into the stream
      const timestamp = new Date(record.kinesis.approximateArrivalTimestamp * 1000);

      const context = new ProcessorContext({
        logger,
        channel,
        deviceId,
        organizationId,
        sourceId,
        templateId,
        timestamp,
      });

      return [data, context];
    })
    .spread((data: any, context: ProcessorContext) => {
      return messageProcessor(data.toString(), context);
    })
    .tapCatch((error) => {
      logger.error({ error }, 'Record processing failed');
    })
    .tap(() => {
      logger.info('Record successfully processed');
    });
}
