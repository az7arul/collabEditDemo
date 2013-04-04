var users = [
	  {id: 1, username: 'azhar', password: 'ffff', email: 'azhar@nc.com'}
	, {id: 2, username: 'az7ar', password: 'ffff', email: 'az7ar@nc.com'}	
];


var findUserById = function(id, fn) {
	var idx= id -1;
	if(users[idx]){
		fn(null, users[idx])
	} else {
		fn(new Error('User ' + id+ ' does not exists'));
	}
};

var findUserByUsername = function (username, fn) {
  for (var i = 0, len = users.length; i < len; i++) {
    var user = users[i];
    if (user.username === username) {
      return fn(null, user);
    }
  }
  return fn(null, null);
}
module.exports.users = users;
module.exports.findUserById = findUserById;
module.exports.findUserByUsername = findUserByUsername;