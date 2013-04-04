var request = require('request');
var cheerio = require('cheerio');

var login = function(done) {
	var options = {
		  uri: 'http://localhost:3000/login'
		, method: 'POST'
		, form: {
			  username: 'azhar'
			, password: 'ffff'
		}
	}
	request(options, function() {
		done();
	});
};

var getBody = function(done, host) {
	var body;
	request(host, function(err, res, _body) {
		body = _body;
		done();
	});
	return body;
};

describe('CollabEdit ', function() {
	
	describe('unauthenticated user', function() {
		it('should redirect to login page if user not authenticated', function(done) {
			request('http://localhost:3000/', function(err, res, body) {
				if(err){
					throw new Error('Error');
				}
				$ = cheerio.load(body);
				expect($('.loginPage').length).toBe(1);
				done();
			});
		});
	});
	
	describe('authenticated user', function() {
		
		it('Should respond to /', function(done) {
			
			login(done);
			request('http://localhost:3000/', function(err, res, body) {
				if(err) {
					throw new Error('Error');
				}
				expect(res.statusCode).toEqual(200);
				done();
			});
		});

		it('should see 3 modules ', function(done) {
		  login(done);
			request('http://localhost:3000/', function(err, res, body) {
				if(err){
					throw new Error('Error');
				}
				$ = cheerio.load(body);
				expect($('.modules').length).toBe(3);
				done();
			});
		});
		
		it('name should be in #username', function(done) {
			login(done);
			request('http://localhost:3000/', function(err, res, body) {
				if(err){
					throw new Error('Error');
				}
				$ = cheerio.load(body);
				expect($('#username').html()).toBe('azhar');
				done();
			});
		});	
		
		it('should be able to change desription of a module', function(done){
			login(done);
			var options = {
				  uri: 'http://localhost:3000/module/1'
				, method: 'POST'
				, form: {
					desc: 'test'
				}
			}
			
			request(options, function(err, res, body){		

				done();
			});
			var modules  = require(__dirname+'/../Model/module').modules;	
			console.log(modules);	
		});				
	});		
});

















