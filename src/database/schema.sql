
------------------------------------------------------------------------------------------------------------------------
-- Table: report_log
------------------------------------------------------------------------------------------------------------------------

CREATE TABLE report_log
(
  id        SERIAL NOT NULL
    CONSTRAINT report_log_pk
    PRIMARY KEY,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
  payload   TEXT   NOT NULL,
  device_id UUID   NOT NULL,
  group_id  UUID,
  context   JSONB
);

CREATE INDEX report_log_timestamp_index
  ON report_log (timestamp);

CREATE INDEX report_log_device_id_index
  ON report_log (device_id);


------------------------------------------------------------------------------------------------------------------------
-- Table: telemetric_data
------------------------------------------------------------------------------------------------------------------------

CREATE TABLE telemetric_data
(
  id        SERIAL                   NOT NULL
    CONSTRAINT telemetric_data_pk
    PRIMARY KEY,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  key       TEXT                     NOT NULL,
  value     TEXT,
  device_id UUID                     NOT NULL,
  group_id  UUID,
  report_id INTEGER
    CONSTRAINT telemetric_data_report_id_fk
    REFERENCES report_log (id)
);

CREATE INDEX telemetric_data_timestamp_index
  ON telemetric_data (timestamp);

CREATE INDEX telemetric_data_device_id_key_index
  ON telemetric_data (device_id, key);

CREATE INDEX telemetric_data_report_id_index
  ON telemetric_data (report_id);
