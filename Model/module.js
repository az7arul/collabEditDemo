var modules = [
  {id: 1, desc: 'Default description for module 1', lockedBy: 0}
, {id: 2, desc: 'Default description for module 2', lockedBy: 0}
, {id: 3, desc: 'Default description for module 3', lockedBy: 0}
];

var findModuleById = function(id, fn) {
	var idx= id -1;
	if(modules[idx]){
		fn(null, modules[idx])
	} else {
		fn(new Error('module ' + id+ 'does not exists'));
	}
};


var lockModule = function(opt) {
	findModuleById(opt.module_id, function(err, module) {
		if(module && module.lockedBy === 0){
			module.lockedBy = opt.user_id;
			return true;
		} else {
			return false;
		}
	});
};

var releaseLock = function(opt) {
	findModuleById(opt.module_id, function(err, module) {
		if(module && module.lockedBy === opt.user_id){
			module.lockedBy = 0;
		} else {
			return false;
		}
	});
};

module.exports.modules = modules;
module.exports.findModuleById = findModuleById;
module.exports.lockModule = lockModule;
module.exports.releaseLock = releaseLock;