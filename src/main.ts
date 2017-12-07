import 'dotenv/config';

import { Callback, Context } from 'aws-lambda';
import * as Promise from 'bluebird';

import logger from 'lib/logger';
import recordProcessor from 'processors/record';

// Instantiates new logger
const rootLogger = logger();

// Entry point for Lambda execution
export function handler(event: KinesisEvent, context: Context, callback: Callback) {
  rootLogger.info({ event }, 'Received event');

  // Tells Lambda to cease execution as soon as callback is called
  context.callbackWaitsForEmptyEventLoop = false;

  // Verifies that there records to process
  if (!event || !event.Records || event.Records.length === 0) {
    callback();
  }

  // Returns array of promises to be executed simultaneously
  Promise.map(event.Records, (record) => recordProcessor(record, rootLogger))
    .catch((err) => {
      rootLogger.error({ err }, err.message);

      callback(err);
    })
    .finally(() => {
      rootLogger.trace(`End processing event`);

      callback();
    });
}
