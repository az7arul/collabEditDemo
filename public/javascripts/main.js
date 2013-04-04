var workarea = [];
var blacklisted = [];

$(document).ready(function() {
	
	var host = window.location.host.split(':')[0];
	var socket = io.connect('http://' + host);
	var username = $('#username').html();
	
	
	$(".checkbox").click(function() {
		var moduleId = $(this).parent().attr('id');
		var moduleId = moduleId.replace('module-', '');
		var moduleId = parseInt(moduleId);
		
	  if(workarea.indexOf(moduleId) >= 0){
		  console.log('arr del');
		  delete workarea[workarea.indexOf(moduleId)];
		  socket.emit('activity', $.toJSON({type: 'unlock', moduleId: moduleId, username: username}));
	  } else {
		  console.log('arr push');
	  	workarea.push(moduleId);
    	socket.emit('activity', $.toJSON({type: 'lock', moduleId: moduleId, username: username}));
	  }
	});

	
	socket.emit('activity', $.toJSON({ type: 'join', username: username}));
	
	socket.on('activity', function(data) {
		console.log(data);
		if(data.type === 'lock'){
			if(data.username != username){
				$('#module-' + data.moduleId).addClass('no');
				$('#checkbox-' + data.moduleId).hide();
				
			}
		}
		
		if(data.type === 'unlock'){
	      $('#module-' + data.moduleId).removeClass('no');
      	$('#checkbox-' + data.moduleId).show();
		}
		
		if(data.type === 'reset'){
			$('#module-' + data.module.id).removeClass('no');
			$('#moduledesc-' + data.module.id).html(data.module.desc);
			$('#module' + data.module.id + 'desc').attr('value', data.module.desc);
		}
	});
	
});