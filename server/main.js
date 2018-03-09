var fs = require('fs');
var express = require('express');
var bodyParser = require('body-parser')
var sha256 = require('sha256')
var request = require('request')
var apiKey = '3cf0bc8500147ae3689fa97bf6197dfca0374fdc'

var app = express();
    app.use(bodyParser.json())
    app.use(bodyParser.urlencoded({
        extended: true }
    ))

let Rfilename
let Rhash

    app.post('/filename', function(req, res){
        console.log(req.body)
        Rfilename = req.body.filename
        Rhash = req.body.Hash
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

    app.post('/getfileinformation', function(req,res){
        var Hash = req.body.Hash
        var fileName = req.body.nameFile
        var pathToFile = __dirname + "/users/" + Hash + "/" + fileName
        if(fs.existsSync(pathToFile)){
            var Information = fs.statSync(pathToFile)
            res.send({ fileInformation: Information})
        }
        return res.send({Msg : "File Not Found"})
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
        req.pipe(fs.createWriteStream(__dirname + "/users/" + Rhash + "/" + Rfilename));
        req.on('end', next);
    })

    app.post('/myfiles', function(req,res){
        var Hash = req.body.hash
        var dirPath = __dirname + "/users/" + Hash.toString()
        if(fs.existsSync(dirPath)){
            var fileobjects = []
            var filesArray = fs.readdirSync(dirPath)
            for(var i=0 ; i< filesArray.length;i++){
                var localFileSize = fs.statSync(dirPath + "/" + filesArray[i])
                fileobjects[i] = { fileName: filesArray[i],
                                    fileSize: localFileSize['size']/1000000}
            }
            res.send({Files : fileobjects})
        }
        else{
            res.send({Msg: "404 File Not Found heHe"})
        }
    })


    app.post('/createaconversionrequest',function(req,res){
        var lfileType = req.body.fileType
        console.log(lfileType)

        request.get('https://sandbox.zamzar.com/v1/formats/' + lfileType.toString(), function (err, response, body) {
            if (err) {
                console.log('Unable to get formats', err)
                res.send(err)
            } else {
                console.log('SUCCESS! Supported Formats:', JSON.parse(body))
                res.send(body)
            }
        }).auth(apiKey, '', true);


    })

    app.post('/startconversionjob', function(req,res){
        var userHash = req.body.suserHash,
        fileName = req.body.sfileName,
        targetFile = req.body.stargetFile, 
        pathToFile = __dirname + "/users/" + userHash + "/" + fileName,
        formData = {
            target_format: targetFile,
            source_file: fs.createReadStream(pathToFile)
        };

        request.post({url:'https://sandbox.zamzar.com/v1/jobs/', formData: formData}, function (err, response, body) {
            if (err) {
                console.error('Unable to start conversion job', err);
                res.send(err)
            } else {
                console.log('SUCCESS! Conversion job started:', JSON.parse(body));
                res.send(body)
            }
        }).auth(apiKey, '', true);

        
    })

    app.listen(3000)