const insertQuery = require('../queries/telemetric-data.sql');

export function insert(data: TelemetricData) {
  return {
    text: insertQuery,
    values: [data.timestamp, data.key, data.value, data.deviceId, data.groupId, data.reportId],
  };
}
