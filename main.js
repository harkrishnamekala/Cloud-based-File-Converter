const electron = require('electron')
const url = require('url')
const path = require('path')
const fs = require('fs')
const request = require('request')
const sha256 = require('sha256')


const {app, BrowserWindow, Menu} = electron

let mainWindow
let uploadWindow
let userWindow

const ipc = require('electron').ipcMain
const dialog = require('electron').dialog
const Server = "http://127.0.0.1:3000"





ipc.on('open-file-dialog', function (event) {
  dialog.showOpenDialog({
    properties: ['openFile']
  }, function (files) {
    if (files) event.sender.send('selected-directory', files)
  })
});

ipc.on('file-upload-request', function (event, fileobject) {
    
    uploadWindow = new BrowserWindow({
        width: 600,
        height:300
    });

    uploadWindow.loadURL(url.format({
        pathname: path.join(__dirname,'uploading.html'),
        protocol:'file',
        slashes: true
    }));

    ipc.on('sync-file-path-req', function (event, arg) {
        event.returnValue = fileobject;
      });

    event.sender.send('file-upload-request-reply', 'received')
    
  })

  ipc.on('open-information-dialog', function (event) {
    const options = {
      type: 'info',
      title: 'Information',
      message: "File Upload Complete",
      buttons: ['Ok']
    }
    dialog.showMessageBox(options, function (index) {
      event.sender.send('information-dialog-selection', index)
    })
  })

ipc.on('file-upload-complete', function(event, arg){
    uploadWindow.close()
})
// Application is starting here ####################################################
app.on('ready',function(){


  ipc.on('login-cred-ask', function (event,arg){
    var username = arg.lusername, password = arg.lpassword
    
    localcredentials = request.post(Server + "/createuser", {form: { usernamec : username,
        passwordc : password}},function(error, response,responsebody){
          console.log(error)
          console.log(response.statusCode)
          console.log(responsebody.toString())
        })

    var cred = { localUsername: username,
    localPassword: password }

    if (!fs.existsSync(app.getPath("home") + "/CBFSAC")){
        fs.mkdirSync(app.getPath("home") + "/CBFSAC");
    }
//Create File Here
    fs.writeFileSync(app.getPath("home") + "/CBFSAC/credentials.json", JSON.stringify(cred));
    startmainWindows()
    userWindow.close()

    event.returnValue = "Received"
  })

    function createnewuserwindow(){
        userWindow = new BrowserWindow({
            width: 400,
            height: 900
        })
    
        userWindow.loadURL(url.format({
            pathname: path.join(__dirname,'userdetails.html'),
            protocol: 'file',
            slashes: true
        }))

    }

    function fetechcredentails(){
    var configfile = app.getPath("home") + "/CBFSAC/credentials.json"
    if(fs.existsSync(configfile)){
        var rawdata = fs.readFileSync(configfile)
        var credentials = JSON.parse(rawdata)
        return credentials
    }
        
    return "userNotFound"

    }

    function checkcredentialsonserver(credentials){
        var localLoginStatus = false
        check = request.post(Server + "/checkuser", { form:  { hash: sha256(JSON.stringify(credentials))}}, function(error, response, responsebodycheck){
            console.log(responsebodycheck.Auth)
            var responsedata = JSON.parse(responsebodycheck)
            if(responsedata.Auth){
                console.log("passed up to Auth Success")
                startmainWindows()
            }
            else {
                console.log("Passed Into create new user")
                createnewuserwindow()
            }
        })
        return localLoginStatus
    }

    function startmainWindows(){
        mainWindow = new BrowserWindow({
            width: 1100,
            height:670
        })
    
        mainWindow.loadURL(url.format({
            pathname: path.join(__dirname,'mainwindow.html'),
            protocol: 'file:',
            slashes: true
        }));

        //Quit App when Closed

        mainWindow.on('closed', function(){
            app.quit();
        });
    }
    //Build Menu from Template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    
    //Insert The Menu
    Menu.setApplicationMenu(mainMenu);

    localUserCred = fetechcredentails()
    console.log(localUserCred)
    if(localUserCred !== "userNotFound"){
        checkcredentialsonserver(localUserCred)
    }
    else{
        createnewuserwindow()
    }
});


//Handle create Add Window

function createAddWindows(){
    addWindow = new BrowserWindow({
        width: 200,
        height:200,
        title: 'Sample Application'
    });

    addWindow.loadURL(url.format({
        pathname: path.join(__dirname,'addwindow.html'),
        protocol: 'file:',
        slashes: true
    }));

    //Garbage Collection
    addWindow.on('close',function(){
        
    });

}

//Menu Template

const mainMenuTemplate = [ 
    {
        label: 'Add Item',
        click(){
            createAddWindows();
        }
    },
    {
        label: 'File',
        submenu:[
            {
                label : 'Quit',
                accelerator : process.platform == 'darwin'? 'Command+Q' : 'Ctrl+Q',
                click(){
                    app.quit();
                }
            }
        ]
    }
];


if(process.env.NODE_ENV !== 'production'){
    mainMenuTemplate.push({
      label: 'Developer Tools',
      submenu:[
        {
          role: 'reload'
        },
        {
          label: 'Toggle DevTools',
          accelerator:process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
          click(item, focusedWindow){
            focusedWindow.toggleDevTools();
          }
        }
      ]
    });
  }