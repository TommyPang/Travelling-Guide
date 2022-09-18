const searchUtil = require("../util/search.js")
const http = require('http'); // 1 - Import Node.js core module
const express = require('express');
const {search} = require("../util/search");

const app = express();

app.use(express.json());

app.post('/info', async function(request, response){
    console.log(request.body) // parsed JSON
    const data = request.body;
    let info = await search(data.name, data.longitude, data.latitude);
    response.send(info); // echo the result back
});


app.listen(5000); //3 - listen for any incoming requests
console.log('Node.js web server at port 5000 is running..');

//search("Mountain View", -122.0838511, 37.3860517);