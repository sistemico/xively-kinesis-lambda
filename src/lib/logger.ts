import * as fs from 'fs';
import * as logger from 'pino';
import { LoggerOptions, SerializerFn } from 'pino';

import { isUtf8 } from 'lib/helpers/buffer';
import { XivelyKinesisEnvelope } from 'lib/kinesis/envelope';

const { LOG_LEVEL, NODE_ENV } = process.env;

export default function ({ level, serializers, ...otherOptions }: Partial<LoggerOptions> = {}) {
  const options: LoggerOptions = {
    level: level || LOG_LEVEL,
    serializers: {
      err: logger.stdSerializers.err,

      envelope: (envelope: XivelyKinesisEnvelope) => {
        // Stringifies buffer data, if possible with utf8, otherwise with base64
        const contentBody = envelope.contentBody;
        const contentBodyEncoding = isUtf8(contentBody) ? 'utf8' : 'base64';
        const body = contentBody.toString(contentBodyEncoding);

        return {
          source: envelope.sourceProperties,
          target: envelope.targetProperties,
          body,
        };
      },

      state: (state: any) => {
        const { log, ...rest } = state;

        return rest;
      },

      ...serializers,
    },
    ...otherOptions,
  };

  if (!options.name) {
    const { name } = require('../../package.json');

    options.name = name;
  }

  return NODE_ENV === 'production' || NODE_ENV === 'test'
    ? logger(options)
    : logger(options, fs.createWriteStream('./log'));
}



