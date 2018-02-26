const electron = require('electron')
const url = require('url')
const path = require('path')


const {app, BrowserWindow, Menu} = electron

let mainWindow
let uploadWindow

const ipc = require('electron').ipcMain
const dialog = require('electron').dialog





ipc.on('open-file-dialog', function (event) {
  dialog.showOpenDialog({
    properties: ['openFile']
  }, function (files) {
    if (files) event.sender.send('selected-directory', files)
  })
});

ipc.on('asynchronous-message', function (event, arg) {
    uploadWindow = new BrowserWindow({
        width: 200,
        height:200
    });

    uploadWindow.loadURL(url.format({
        pathname: path.join(__dirname,'uploading.html'),
        protocol:'file',
        slashes: true
    }));

    
  })

ipc.on('onasync-upload-complete', function(event, arg){
    uploadWindow.close()
})

app.on('ready',function(){
    mainWindow = new BrowserWindow({
        width: 1100,
        height:670
    });

    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname,'mainwindow.html'),
        protocol: 'file:',
        slashes: true
    }));


//Quit App when Closed

mainWindow.on('closed', function(){
    app.quit();
});
    //Build Menu from Template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    
    //Insert The Menu
    Menu.setApplicationMenu(mainMenu);
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