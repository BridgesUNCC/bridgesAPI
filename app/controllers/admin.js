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

//returns a simple document that show case the different admin features
exports.help = function(req, res) {
    protectAdmin(req, res);
    
    return res.render('admin/help');
}

// return a JSON array of all usernames
// requires an admin account
exports.allusers = function(req, res) {
    protectAdmin(req, res);
    
    User.find ({},{username:true})
	.exec(function (err, users) {
	    var userlist = [];

	    for (var idx in users) {
		var u = users[idx];
		userlist.push(u.username);
	    }

	    res.setHeader('Content-Type', 'application/json');
	    res.end(JSON.stringify(userlist));
    });
}

// use since get parameter to construct a time date.
// If no such parameter is in the query, use the beginning of current month.
// invalid dates are ignored
// returns Date
function constructSince(req) {
    var sinceTime = undefined;
    
    if (req.query.since) {
	sinceTime = new Date(req.query.since);
    }

    if (!sinceTime || isNaN(sinceTime)) {
	sinceTime = new Date(); //now
	sinceTime.setDate(0);
	sinceTime.setHours(0);
	sinceTime.setMinutes(0);
	sinceTime.setSeconds(0);
	sinceTime.setMilliseconds(0);
    }
    
    return sinceTime;
}

//return a JSON object specifying the number of recent assignment
//if no since date is given. 
exports.nbrecentassignments = function(req, res) {
    protectAdmin(req, res);

    const thresholddate = constructSince(req);
    
    Assignment.find({subAssignment: '00', // only counting the first subassignment
		     dateCreated: {$gt: thresholddate},
		    },
		    { //projecting to retain only few fields
			username:true,
			assignmentID:true,
			dateCreated:true
		    })
	.exec(function (err, ass) {
	    var nb = 0;
	    
	    for (var idx in ass) {
		nb++;
	    }

	    res.setHeader('Content-Type', 'application/json');
	    res.end(JSON.stringify({nb}));
    });
}

//return a JSON object specifying the number of recent assignment per user.
//users that have no assignment in the time window are not included
//if no since date is given. 
exports.recentassignmentsperuser = function(req, res) {
    protectAdmin(req, res);

    const thresholddate = constructSince(req);

    
    Assignment.find({subAssignment: '00', // only counting the first subassignment
		     dateCreated: {$gt: thresholddate},
		    },
		    { //projecting to retain only few fields
			username:true,
			assignmentID:true,
			dateCreated:true
		    })
	.exec(function (err, ass) {
	    var count={};
	    
	    for (var idx in ass) {
		var a = ass[idx];
		if (!(a.username in count))
		    count[a.username] = 0
		count[a.username] ++;
	    }

	    res.setHeader('Content-Type', 'application/json');
	    res.end(JSON.stringify(count));
    });
}
