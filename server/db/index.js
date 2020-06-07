const { Pool } = require("pg");

const pool = new Pool({
  host: "qna_postgres",
  user: "postgres",
  password: '123456789',
  database: "postgres",
  port: 5432,
  max: 50,
  idleTimeoutMillis: 1000,
  connectionTimeoutMillis: 1000,
  maxUses: 7500,
});

// pool.on(()=>{console.log('process.env.PASSWORD', process.env.PASSWORD)})
pool.on("error", (err, client) => {
  console.error("Unexpected error on idle client:", err);
  process.exit(-1);
});

// const db = await pool.connect();

module.exports = pool;