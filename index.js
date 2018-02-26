//Libraries
const mkdirp = require('../node_modules/mkdirp');
const fse = require("../node_modules/fs-extra");
const unzip = require("../node_modules/unzip-crx");
//.......................Basic Libraries........................//
const fs = require('fs');
const path = require("path");
var https = require('https');

//........................Folders................................//
const listFolder = path.join(__dirname,"..","extensions");
const currentFolder = path.join(__dirname,"..","lib");
const installedFolder = path.join(__dirname,"..","installed_extensions");

//...................Writing current instance......................//
fs.readFile(currentFolder+"/current-build.txt","utf8",function (err, data) {
	console.log("Attached Instance: "+data+"\n Start Typing..");
  });

//.....................List the instances..........................//
vorpal
	.command("list",'Outputs "Listing"')  //List all the folders 
	.action(function(args){
		fs.readdir(listFolder, (err, files) => {
		files.forEach(file => {
		var n = file.indexOf(".");
		if(n<0)
		console.log(file);
		});
		}) 
	});

//.................Download a new Build..............................//
	vorpal
	.command("get as ")  
	.option('-n --name <name>')
	.option('-u --url <url>')
	.action(function(args,callback){
		var folderName = args.options.name; //argument name 
		var url = args.options.url;
		mkdirp(listFolder+"/"+folderName+'/editors',{ //create a directory
			if (err) {console.error(err)}
		});
		mkdirp(listFolder+"/"+folderName+'/players',{
			if (err) {console.error(err)}
		});
		setTimeout(() => {
		var editorFile = fs.createWriteStream(listFolder+"/"+folderName+"/editors/editor.crx"); //writestream
		var playerFile = fs.createWriteStream(listFolder+"/"+folderName+"/players/player.crx");
		var editorRequest = https.get(url+"/api/public/admin/extensions/editor/letznav_editor.crx", function(response) {
		  response.pipe(editorFile); //Download File
		  response.on("end", function() {
			console.log("Downloading Editor complete");
		});
		});
		var playerRequest = https.get(url+"/api/public/admin/extensions/player/letznav_player.crx", function(response) {
		  response.pipe(playerFile);
		  response.on("end", function() {
			console.log("Downloading Player complete");
		});
		});
		},2000);
		console.log("waiting for Download...");
		// callback();
	});

//.................Extract a new Build..............................//
	vorpal
	.command("extract")
	.option("-n --name <name>")
	.action(function(args,callback){
		var folderName = args.options.name;
	var editorZip = listFolder+"/"+folderName+"/editors/editor.crx"; //read file
	var playerZip = listFolder+"/"+folderName+"/players/player.crx";
	unzip(editorZip).then(() => { //Unzip CRX file
		console.log("Successfully unzipped your crx file..");
	  });
	unzip(playerZip).then(() => {
		console.log("Successfully unzipped your crx file..");
	  });
	});

//.................set a Build..............................//
	vorpal
	.command("set")
	.option("-n --name <name>")
	.action(function(args,callback){
		var folderName = args.options.name;
		fse.emptyDir(installedFolder+'/editor/editor', err => { //empty previous files
			if (err)
			return console.error(err);
			});
			fse.emptyDir(installedFolder+'/player/player', err => {
				if (err)
				return console.error(err);
				});
				setTimeout(() => {
		fse.copySync(listFolder+"/"+folderName+"/editors/editor",installedFolder+"/editor/editor");  //Copy files of new build
		fse.copySync(listFolder+"/"+folderName+"/players/player",installedFolder+"/player/player");
	},2000);
	fs.writeFile(currentFolder+"/current-build.txt",folderName,callback);
	console.log("Attched Instance: "+folderName);
	});

//.................remove a Build..............................//
	vorpal
		.command("remove")
		.option("-n --name <name>")
		.action(function(args){
			var folderName = args.options.name;
			console.log(listFolder+"/"+folderName)
			fse.remove(listFolder+"/"+folderName, err => {
				if (err) return console.error(err)
				console.log('success!')
			  })
			  fs.readFile(currentFolder+"/current-build.txt","utf8",function (err, data) {
				if (err) throw err;
				fs.readFile(currentFolder+"/current-build.txt","utf8",function (err, data) {
				if (err) throw err;
				// console.log(data);
				if(data==folderName){
					fs.writeFile(currentFolder+"/current-build.txt","The attached instance was removed");
				}
 				 });
			  });
		});

