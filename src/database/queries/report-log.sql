INSERT INTO report_log(timestamp, payload, device_id, group_id, context)
VALUES ($1, $2, $3, $4, $5)
RETURNING id