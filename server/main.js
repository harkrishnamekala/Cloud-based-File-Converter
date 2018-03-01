var fs = require('fs');
var express = require('express');
var bodyParser = require('body-parser')

var app = express();
    app.use(bodyParser.json())
    app.use(bodyParser.urlencoded({
        extended: true }
    ))


    app.post('/filename', function(req, res){
        console.log(req.body)
        res.send({
            Msg : "File Name Received Awating File Data",
            Data : req.body
        })
    })

    app.post('/filepost', function (req, res, next) {
        req.pipe(fs.createWriteStream('./uploadFile'));
        req.on('end', next);
    })

    app.listen(3000)