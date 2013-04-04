//var require(__dirname + '/../../Model/module');

describe("User ", function() {
	
	var users; 
	beforeEach(function() {
	    users = require(__dirname + '/../../Model/user').users;
	    findUserById = require(__dirname + '/../../Model/user').findUserById;
	    findUserByUsername = require(__dirname + '/../../Model/user').findUserByUsername;
	});
	
	it('should return a user by id', function() {
		findUserById(1,function(err, user) {
			expect(user.id).toBe(1);
		});
	});
	
	it('should return a user by username', function() {
		findUserByUsername('azhar', function(err, user) {
			expect(user.username).toBe('azhar');
		});
	});
});