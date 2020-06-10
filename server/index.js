const express = require("express");
const bodyParser = require('body-parser')
const QnARoutes = require('./router/QnARoutes.js')
const app = express();
const PORT = 3555;

//middleware
app.use(bodyParser.json());

//Routes
app.use('/', QnARoutes);

//loader test
app.get("/loaderio-d1272d07066127856e11179f874f42a3", (req, res) => {
  res.send("loaderio-d1272d07066127856e11179f874f42a3");
});

// pool.end(() => console.log("pg pool has ended"));
app.listen(PORT, () => {
  console.log(`Server is listening on port: ${PORT}`);
});
