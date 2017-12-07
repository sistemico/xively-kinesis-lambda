INSERT INTO telemetric_data(timestamp, key, value, device_id, group_id, report_id)
VALUES ($1, $2, $3, $4, $5, $6)
RETURNING *