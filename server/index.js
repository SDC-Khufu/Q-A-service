const express = require("express");
const app = express();
const PORT = process.env.PORT || 3555;

const { Pool } = require('pg');
const pool = new Pool({
    host: 'qna_postgres',
    user: 'postgres',
    password: '123456789',
    database: 'postgres',
    port: 5432,
    max: 1000,
    idleTimeoutMillis: 3000,
    connectionTimeoutMillis: 3000,
    maxUses: 7500,
});


app.get("/", (req, res) => {
    let queryStr = 'select * from questions_transformed where id = 1';
    pool
        .connect()
        .then((client) => {
            return client
            .query(queryStr)
            .then((dbRes) => {
                client.release();
                res.status(200).json(dbRes);
            })
            .catch((err) => {
                client.release();
                console.log(`Get server err: ${err}`);
                res.status(400);
            })
        })
});

pool.end().then(() => console.log('pg pool has ended'))

app.listen(port, () => {
  console.log(`Server is listening on port: ${port}`);
});
