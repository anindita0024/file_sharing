
const express = require("express");
const dotenv = require("dotenv");
const app = express();
const path = require('path');
const mongoose = require("mongoose");

app.use(express.json());

dotenv.config()
mongoose.connect(process.env.MONGO_URL, {useNewUrlparser : true} , () =>{
    console.log("mongodb is connected")
});

app.set('views', path.join(__dirname, '/views'));
app.set('view engine' ,'ejs');


app.use(express.static('public'))

////
app.use('/api/files', require('./routes/files'));
app.use('/files', require('./routes/show'));
app.use('files/download', require('./routes/download'))



app.listen(process.env.PORT , () =>{
    console.log("server is running")
})