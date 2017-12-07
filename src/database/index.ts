import * as Promise from 'bluebird';
import { Pool } from 'pg';

// Use the same environment variables as libpq to connect to a PostgreSQL server
// https://www.postgresql.org/docs/9.6/static/libpq-envars.html
const pool = new Pool({ Promise });

export default pool;
