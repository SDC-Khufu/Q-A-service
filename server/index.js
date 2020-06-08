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
app.get("/loaderio-73a51971681a4f73454e66e4358d3ddb", (req, res) => {
  res.send("loaderio-73a51971681a4f73454e66e4358d3ddb");
});

// pool.end(() => console.log("pg pool has ended"));
app.listen(PORT, () => {
  console.log(`Server is listening on port: ${PORT}`);
});
