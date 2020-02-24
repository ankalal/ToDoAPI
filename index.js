require('dotenv').config()
require("./db/mongoose");
const express = require('express');
const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser.json());

app.use('/user', require('./user.js'))
app.use('/todo', require('./todo.js'))


app.listen(process.env.PORT,()=>{
    console.log("App Started at ",process.env.PORT)
});
