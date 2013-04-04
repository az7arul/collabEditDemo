
/**
 * Module dependencies.
 */

var express = require('express')
  , http = require('http')
  , passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy
  , flash = require('connect-flash')
  , util = require('util')
  , redis = require('redis')
  , path = require('path');

var modules = require(__dirname + '/Model/module').modules;
var users = require(__dirname + '/Model/user').users;
var findUserById = require(__dirname + '/Model/user').findUserById;
var findUserByUsername = require(__dirname + '/Model/user').findUserByUsername;
var findModuleById = require(__dirname + '/Model/module').findModuleById;
var lockModule = require(__dirname + '/Model/module').lockModule;
var unlockModule = require(__dirname + '/Model/module').unlockModule;
var releaseLock = require(__dirname + '/Model/module').releaseLock;


passport.serializeUser(function(user, done){
	done(null, user.id);
});

passport.deserializeUser(function(id, done) {
	findUserById(id, function(err, user) {
		done(err, user);
	})
});

passport.use(new LocalStrategy(
  function(username, password, done) {

    process.nextTick(function () {
      findUserByUsername(username, function(err, user) {
        if (err) { return done(err); }
        if (!user) { return done(null, false, { message: 'Unknown user ' + username }); }
        if (user.password != password) { return done(null, false, { message: 'Invalid password' }); }
        return done(null, user);
      })
    });
  }
));

var app = express();
var server = http.createServer(app);

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('your secret here'));
  app.use(express.session());
	app.use(flash());
	app.use(passport.initialize());
	app.use(passport.session());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});


app.param('module_id', function(req, res, next, module_id) {
	var module_id = parseInt(module_id);
	var module = findModuleById(module_id, function(err, module) {
		if(module){
			console.log('______xxxx_________' + module.id);
			req.module_id = module.id;
		}
	});
	next();
});

app.get('/login', function(req, res) {
	res.render('login', {user: req.user, message: req.flash('error')})
});

app.post('/login', 
  passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }),
  function(req, res) {
    res.redirect('/');
});

app.get('/', ensureAuthenticated, function(req, res) {
	// console.log('in root url');
	// console.log(modules);
	res.render('index', {user: req.user, modules: modules, message: req.flash('error')});
});

app.post('/module/:module_id', ensureAuthenticated, function(req, res) {
	
	var desc = req.body['desc'];
	var user_id = req.user.id;
	
	console.log('in post user id is ' + user_id);
	
	if(req.module_id){
		
		findModuleById(req.module_id, function(err, module) {			
			if(module.lockedBy === user_id)	{		
				module.desc = desc;
				console.log('changed module');
				console.log(module);
				releaseLock({user_id: req.user.id, module_id: module.id});
				
			  var io = require('socket.io-client'),
			  sock = io.connect('localhost',{port: 3000});
		  	sock.emit('activity',JSON.stringify({type: 'reset', module: module}));
				
			} else {
				console.log('not permiteed');
				req.flash('error', 'Not permitted');
			}					
		});
	}	
	res.redirect('/');
});

server.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login')
}


var io = require('socket.io').listen(server);

io.sockets.on('connection', function(socket) {
	var sub = redis.createClient();
	var pub = redis.createClient();
	
	sub.subscribe('activity');
	
	socket.on('activity', function(data) {	
		pub.publish('activity', data);
	  console.log('data receivded' + data);
	});
	
	
	// socket.on('disconnect', function() {
	// 	var a = socket.get('username', function(err, name) {
	// 		findUserbyId(1,function(err, user) {
	// 
	// 			if(err) { throw new Error('User not found');}
	// 			
	// 			for(var i = 0; i < modules.length; i++){
	// 				if(modules[i].lockedBy === user.id) {
	// 					modules[i].lockedBy = 0;
	// 					socket.emit('activity', JSON.stringify({type: 'unlock', moduleId: modules[i].id, username: user.username}));
	// 				}
	// 			}
	// 		});
	// 	});
	// });
	
	
	// socket.on('disconnect', function() {
	// 	var a = socket.get('username', function(err, name) {
	// 		console.log('user disconnected', name);
	// 		var findUserByUsername = require(__dirname + '/Model/user').findUserByUsername;
	// 		
	// 		console.log('disconnected user ---> ' + name);
	// 		
	// 		var n = name;
	// 		findUserByUsername(n, function(err, user) {
	// 			for(var i = 0; i < modules.length; i++){
	// 				
	// 				console.log('=------------' + user.id);
	// 				if(modules[i].lockedBy === user.id) {
	// 					modules[i].lockedBy = 0;
	// 					console.log(module[i]);						
	// 				//	var io2 = require('socket.io-client'),
	// 				//  sock2 = io.connect('localhost',{port: 3000});
	// 			 // 	sock2.emit('activity', JSON.stringify({type: 'unlock', moduleId: modules[i].id, username: user.username}));
	// 					pub.publish('activity', JSON.stringify({type: 'unlock', moduleId: modules[i].id, username: user.username}));
	// 			//		io.sockets.emit('activity', JSON.stringify({type: 'unlock', moduleId: modules[i].id, username: user.username}));
	// 					console.log('----------done');
	// 					console.log(modules);
	// 				}
	// 			}
	// 		});
	// 	});
	// });
	// 
	
	sub.on('message', function(channel, message) {
		var msg = JSON.parse(message);
		console.log('channel -> ' + channel + ' with message : ' + msg);		
		console.log('message type ' + msg.type);
			
		if(msg.type === 'reset'){
			socket.emit(channel, msg);
		}	
			
		if(msg.type == 'join'){
			socket.set('username', msg.username, function() {
				console.log('user name set');
			});
			console.log('user joined --->>>> '+ msg.username);
		}	
		
	  if(msg.type === 'lock') {
		  console.log(msg.moduleId);
		  var module_id = modules[msg.moduleId -1].id;
		  var module = modules[msg.moduleId-1];
		
		  console.log('module_id is ' + module_id);
			var user_id = findUserByUsername(msg.username, function(err, user) {
				if(user){
					console.log('type lock: user id is ' + user.id );
					return user.id;					
				}				
			});
			console.log('------------' + module.lockedBy);
		  console.log('module.lockedBy === 0' + (module.lockedBy === 0));
		  if(module.lockedBy === 0 || module.lockedBy === user_id){
			  console.log('locking module');
			  lockModule({user_id: user_id, module_id: module_id});
			 socket.emit(channel, msg);  
		  }	
			  
		  console.log(modules);
	  }
	  
	  if(msg.type === 'unlock') {
		  console.log(msg.moduleId);
		  var module_id = modules[msg.moduleId -1].id;
		  var module = modules[msg.moduleId-1];
		
		  console.log('module_id is ' + module_id);
			var user_id = findUserByUsername(msg.username, function(err, user) {
				if(user){
					console.log('type lock: user id is ' + user.id );
					return user.id;					
				}				
			});
			console.log('------------' + module.lockedBy);
		  console.log('module.lockedBy === 0' + (module.lockedBy === 0));
		  if(module.lockedBy === user_id || module.lockedBy === 0){
			  console.log('unlocking module');
			  releaseLock({user_id: user_id, module_id: module_id});
				socket.emit(channel, msg);  
		  }	
			  
		  console.log(modules);
	  }
	
	});
	
});