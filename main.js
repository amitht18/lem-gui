const electron = require('electron')
const mkdirp = require('mkdirp')
const fse = require('fs-extra')
const unzip = require('unzip-crx')

// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

const path = require('path')
const url = require('url')
const https = require('https')
const fs = require('fs')

//........................Folders................................//
const listFolder = "extensions";
const currentFolder = "lib";
const installedFolder = "installed_extensions";


//...................Writing current instance......................//
// fs.readFile(currentFolder+"/current-build.txt","utf8",function (err, data) {
// console.log('Running');
//   });



  mkdirp('extensions',{ //create a directory
    if (err) {console.error(err)}
  });
  mkdirp('installed_extensions',{
    if (err) {console.error(err)}
  });
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 600, height: 460,resizable: false})

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

function addExtension(name,url){
  var success_field =document.getElementById("success");
  var success_message = "";
  console.log("in ADD");
  console.log(name+url)
  mkdirp(listFolder+"/"+name+'/editors',{ //create a directory
    if (err) {console.error(err)}
  });
  mkdirp(listFolder+"/"+name+'/players',{
    if (err) {console.error(err)}
  });
  setTimeout(() => {
  var editorFile = fs.createWriteStream(listFolder+"/"+name+"/editors/editor.crx"); //writestream
  var playerFile = fs.createWriteStream(listFolder+"/"+name+"/players/player.crx");
  var editorRequest = https.get(url+"/api/public/admin/extensions/editor/letznav_editor.crx", function(response) {
    console.log("writing");
    response.pipe(editorFile); //Download File
    response.on("end", function() {
    success_message = "\nDownloading complete"+ "<img height=40 weight=40 src='https://cdn0.iconfinder.com/data/icons/simple-icons-ii/69/04-512.png' alt'success'>";
    success_field.innerHTML=success_message;
  });
  });
  var playerRequest = https.get(url+"/api/public/admin/extensions/player/letznav_player.crx", function(response) {
    response.pipe(playerFile);
    response.on("end", function() {
    // var success_message = document.getElementById("success").value;
    success_message = "\nDownloading complete"+ "<img height=40 weight=40 src='https://cdn0.iconfinder.com/data/icons/simple-icons-ii/69/04-512.png' alt'success'>";
  success_field.innerHTML=success_message;
    extract(name);
  });
  });
  },2000);
var submit_button = document.getElementById('submit');
submit_button.parentNode.removeChild(submit_button);
  success_message = "\nWaiting for Download...";
success_field.innerHTML=success_message;
}

function extract(name){
  var success_field =document.getElementById("success");
  var success_message = "";
  var editorZip = listFolder+"/"+name+"/editors/editor.crx"; //read file
  var playerZip = listFolder+"/"+name+"/players/player.crx";
  setTimeout(1000);
	unzip(editorZip).then(() => { //Unzip CRX file
  // success_message = "\nSuccessfully unzipped your crx file";
  // success_field.innerHTML=success_message;
	  });
	unzip(playerZip).then(() => {
  //   success_message = "\nSuccessfully unzipped your crx file";
  // success_field.innerHTML=success_message;
    });
}

function setStarted(){
var radio_class = document.getElementsByClassName("radio")[0];
var buildList = "<br>";
fs.readdir(listFolder, (err, files) => {
  files.forEach(file => {
  var n = file.indexOf(".");
  if(n<0){
  buildList = buildList + '<input type="radio" name="build" value='+file+' class="radio-element">'+file+'<br>';
  radio_class.innerHTML = buildList;
  }
  });
  });
}

function setBuild(){
  console.log("In set build");
 var name= document.querySelector('input[name="build"]:checked').value;
  fse.emptyDir(installedFolder+'/editor/editor', err => { //empty previous files
    if (err)
    return console.error(err);
    });
    fse.emptyDir(installedFolder+'/player/player', err => {
      if (err)
      return console.error(err);
      });
      setTimeout(() => {
  fse.copySync(listFolder+"/"+name+"/editors/editor",installedFolder+"/editor/editor");  //Copy files of new build
  fse.copySync(listFolder+"/"+name+"/players/player",installedFolder+"/player/player");
},2000);
// fs.writeFile(currentFolder+"/current-build.txt",name);
console.log("Attched Instance: "+name);
var set_button = document.getElementById('set_button');
var set_message = document.getElementById('set_success');
set_button.parentNode.removeChild(set_button);
  set_message.innerHTML='Attached Instance: '+name+ "<img height=40 weight=40 src='https://cdn0.iconfinder.com/data/icons/simple-icons-ii/69/04-512.png' alt'success'>";
}