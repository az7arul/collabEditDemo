//var require(__dirname + '/../../Model/module');

describe("Module ", function() {
	
	var modules; 
	var findModuleById;

	
	beforeEach(function() {
	    modules = require(__dirname + '/../../Model/module').modules;
			findModuleById = require(__dirname + '/../../Model/module').findModuleById;
			lockModule = require(__dirname + '/../../Model/module').lockModule;
			releaseLock = require(__dirname + '/../../Model/module').releaseLock;

	  });
	
	afterEach(function() {
		modules = [
								  {id: 1, desc: 'Default description for module 1', lockedBy: 0}
								, {id: 2, desc: 'Default description for module 2', lockedBy: 0}
								, {id: 3, desc: 'Default description for module 3', lockedBy: 0}
								];
	});
	
	it('Should return have a list of 3 modules', function() {
		expect(modules.length).toBe(3);
	});
	
  describe("FindModuleById ", function() {
	
		it('should return a module by its id', function() {
			 findModuleById(1, function(err, module) {
				expect(module.id).toBe(1);
			});
		});

		it('should throw an Error object module is not found', function() {
				findModuleById(4, function(err, module) {
					expect(err).toBeDefined();
				});
		});
  });

	describe("lockModule", function() {
		 it('should lock a module', function() {
			  var opt = {user_id: 1, module_id: 1};
			  lockModule(opt);
			  expect(modules[0].lockedBy).toBe(1);
		 });	
		
		 it('should not lock a module that is locked by another user', function() {
			  modules[1].lockedBy = 1;
			  var opt = {module_id: 1, user_id: 2}
			  lockModule(opt);
			  expect(modules[0].lockedBy).toBe(1);
		});	
	});
	
	describe("releaseLock", function() {
		it('should release the lock on a module',function() {
			var opt = {user_id: 2, module_id: 3};
			lockModule(opt);
			expect(modules[2].lockedBy).toBe(2);
			releaseLock(opt);
			expect(modules[2].lockedBy).toBe(0);
		})
	});
	
});