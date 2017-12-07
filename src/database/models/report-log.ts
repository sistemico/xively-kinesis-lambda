const insertQuery = require('../queries/report-log.sql');

export function insert(data: ReportLog) {
  return {
    text: insertQuery,
    values: [data.timestamp, data.payload, data.deviceId, data.groupId, data.context],
  };
}
