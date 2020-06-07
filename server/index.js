const express = require("express");
const bodyParser = require('body-parser')
const QnARoutes = require('./router/QnARoutes.js')
const app = express();
const PORT = 3555;

//middleware
app.use(bodyParser.json());

//Routes
app.use('/', QnARoutes);


// pool.end(() => console.log("pg pool has ended"));
app.listen(PORT, () => {
  console.log(`Server is listening on port: ${PORT}`);
});
