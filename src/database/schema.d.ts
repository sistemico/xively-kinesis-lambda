//
// DB schema
//

// Table: report_log
interface ReportLog {
  id?: number;
  timestamp: string;
  payload: string;
  deviceId: string;
  groupId?: string;
  context?: any;
}

// Table: telemetric_data
interface TelemetricData {
  id?: number;
  timestamp: string;
  key: string;
  value: boolean | number | object | string;
  deviceId: string;
  groupId?: string;
  reportId?: number;
}
