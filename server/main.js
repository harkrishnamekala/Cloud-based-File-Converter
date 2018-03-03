var fs = require('fs');
var express = require('express');
var bodyParser = require('body-parser')

var app = express();
    app.use(bodyParser.json())
    app.use(bodyParser.urlencoded({
        extended: true }
    ))

let Rfilename

    app.post('/filename', function(req, res){
        console.log(req.body)
        Rfilename = req.body.filename
        res.send({
            Msg : "File Name Received Awating File Data",
            Data : req.body
        })
    })

    app.post('/createuser', function(req, res){
        console.log(req.body)
        var username = req.body.usernamec
        var password = req.body.passwordc
        res.send({
            Msg : "User Created",
            Data : req.body
        })
    })

    app.post('/checkuser', function(req, res){
        var hash = req.body.hash
        //Verification Code
        //send Response
    })

    app.post('/filepost', function (req, res, next) {
        req.pipe(fs.createWriteStream('./'+ Rfilename));
        req.on('end', next);
    })

    app.listen(3000)