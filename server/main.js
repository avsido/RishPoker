const 
	express = require('express'),
	session = require('express-session'),
    sharedSession = require('express-socket.io-session'),
	serveStatic = require('serve-static'),
	socketIo  = require('socket.io'),
	path = require("path");
	app = express(),
	clientPath = path.join(__dirname, "..", "client"),
	sessionOptions = {
		secret: 'somesecretkey',
		resave:false,
		saveUninitialized:true,
		cookie: {maxAge: 3600000}
	},
	sessionMiddleware = session(sessionOptions),
	server  = require('http').createServer(app),
	io = socketIo(server),
	myServerModule = require("./modules/myserver");
app.use(sessionMiddleware);
io.use(sharedSession(
	sessionMiddleware, {autoSave: true}
));
app.use(express.static(clientPath));

const myServer = new myServerModule(server,app,io);

myServer.start();