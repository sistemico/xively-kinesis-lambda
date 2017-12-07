require('dotenv/config');

const AWS = require('aws-sdk');
const Promise = require('bluebird');
const colors = require('colors');
const MemoryFS = require('memory-fs');
const path = require('path');
const webpack = require('webpack');

const { AWS_LAMBDA_NAME, AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, DIST_NAME = 'lambda' } = process.env;
const config = require('../webpack.config');

Promise.resolve(config)
  .then(function build(config) {
    const fs = new MemoryFS();

    return new Promise((resolve, reject) => {
      const compiler = webpack(config);

      // Makes Webpack use memory-fs
      compiler.outputFileSystem = fs;

      // Runs build process
      compiler.run((err, stats) => {
        if (err || stats.compilation.errors.length > 0) {
          return reject(err || stats.compilation.errors);
        }

        const package = fs.readFileSync(
          path.resolve(config.output.path, `${DIST_NAME}.zip`)
        );

        resolve(package);
      });
    });
  })
  .then(function deploy(zipFile) {
    if (AWS_LAMBDA_NAME && AWS_ACCESS_KEY_ID && AWS_SECRET_ACCESS_KEY) {
      const lambda = new AWS.Lambda({ region: AWS_REGION });

      const params = {
        FunctionName: AWS_LAMBDA_NAME,
        // DryRun: true || false,
        // Publish: true || false,
        ZipFile: zipFile //|| 'STRING_VALUE'
      };

      lambda.updateFunctionCode(params, (err, data) => {
        if (err) {
          console.log(colors.white.bgRed(' Failed to deploy to AWS Lambda ')
            + ' on ' + new Date().toString());

          return console.error(err);
        }
        console.log(colors.black.bgGreen(' Successfully deployed to AWS Lambda ')
          + ' on ' + new Date().toString(data.LastModified));
      });
    }
  })
  .catch((err) => {
    console.error(err);
  });
