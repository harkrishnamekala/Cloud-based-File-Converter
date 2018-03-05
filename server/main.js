var fs = require('fs');
var express = require('express');
var bodyParser = require('body-parser')
var sha256 = require('sha256')

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
        var Cred = {localUsername: req.body.usernamec,
            localPassword: req.body.passwordc}
        var Hash = sha256(JSON.stringify(Cred))
        console.log(Hash.toString())
        console.log(__dirname + "/users/" + Hash.toString())

        if (fs.mkdirSync(__dirname + "/users/" + Hash.toString())){
           
            res.send({
                Msg : "User Created",
                Data : req.body
            })
        
        }
        res.send({
            Msg: "User Creation Failed",
            Data: req.body
        })
    })

    app.post('/checkuser', function(req, res){
        var Hash = req.body.hash
        console.log(req.body.hash)
        console.log(__dirname + "/users/" + Hash.toString())
        if(fs.existsSync(__dirname + "/users/" + Hash.toString())){
            res.send({ Auth: true})
        }
        res.send({Auth:false})
    })

    app.post('/filepost', function (req, res, next) {
        req.pipe(fs.createWriteStream('./'+ Rfilename));
        req.on('end', next);
    })

    app.listen(3000)