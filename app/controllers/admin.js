var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Account = mongoose.model('Account'),
    Assignment = mongoose.model('Assignment'),
    crypto = require('crypto'),
    mail = require('./mail');

function protectAdmin(req, res) {
    var user = req.user || false;

    var handleerror=function() {
	throw new Error ('not admin', 401);
    }
    
    if (!user)
	handleerror();
    
    if (!user.hasAdminRights())
	handleerror();    
}


exports.demo = function(req, res) {

    protectAdmin(req, res);

    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ a: 1 }));

}


exports.allusers = function(req, res) {

    protectAdmin(req, res);
    
    userlist = []
    
    User.find ({},{username:true})
	.exec(function (err, users) {
	    console.log(users);
	    for (var idx in users) {
		var u = users[idx];
		console.log(u);
		userlist.push(u.username);
	    }

	    res.setHeader('Content-Type', 'application/json');
	    res.end(JSON.stringify(userlist));
    });
    
}
