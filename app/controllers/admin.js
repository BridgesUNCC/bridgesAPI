var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Account = mongoose.model('Account'),
    Assignment = mongoose.model('Assignment'),
    SubmissionLog = mongoose.model('SubmissionLog'),
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
	.then(function (users) {
	    var userlist = [];

	    for (var idx in users) {
		var u = users[idx];
		userlist.push(u.username);
	    }

	    res.setHeader('Content-Type', 'application/json');
	    res.end(JSON.stringify(userlist));
    });
}

// use since GET parameter to construct a time date.
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

// use until GET parameter to construct a time date.
// If no such parameter is in the query, use now
// invalid dates are ignored
// returns Date
function constructUntil(req) {
    var untilTime = undefined;
    
    if (req.query.until) {
	untilTime = new Date(req.query.until);
    }

    if (!untilTime || isNaN(untilTime)) {
	untilTime = new Date(); //now
    }
    
    return untilTime;
}


//return a JSON object specifying the number of assignments in a time window.
//uses since and until GET parameters (which default to beginning of the month and now)
exports.nbassignmentsbydate = function(req, res) {
    protectAdmin(req, res);

    const sincedate = constructSince(req);
    const untildate = constructUntil(req);

    Assignment.find({subAssignment: '00', // only counting the first subassignment
		     $and: [ { dateCreated: {$lt: untildate} }, //in the right time window
			     { dateCreated: {$gt: sincedate} }
			   ],
		    },
		    { //projecting to retain only few fields
			username:true,
			assignmentID:true,
			dateCreated:true
		    })
	.then(function (ass) {
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
//uses since and until GET parameters (which default to beginning of the month and now)
exports.assignmentsperuserbydate = function(req, res) {
    protectAdmin(req, res);

    const sincedate = constructSince(req);
    const untildate = constructUntil(req);
    
    Assignment.find({subAssignment: '00', // only counting the first subassignment
		      $and: [ { dateCreated: {$lt: untildate} }, //in the right time window
			     { dateCreated: {$gt: sincedate} }
			   ],
		    },
		    { //projecting to retain only few fields
			username:true,
			assignmentID:true,
			dateCreated:true
		    })
	.then(function (ass) {
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

//return a JSON object specifying the number of assignment per user in a time window.
//users that have no assignment in the time window are not included.
//uses since and until GET parameters (which default to beginning of the month and now)
exports.nbuserbydate = function(req, res) {
    protectAdmin(req, res);

    const sincedate = constructSince(req);
    const untildate = constructUntil(req);

    
    Assignment.find({subAssignment: '00', // only counting the first subassignment
		      $and: [ { dateCreated: {$lt: untildate} }, //in the right time window
			     { dateCreated: {$gt: sincedate} }
			   ],
		    },
		    { //projecting to retain only few fields
			username:true,
			assignmentID:true,
			dateCreated:true
		    })
	.then(function (ass) {
	    var count={};
	    
	    var nb = 0;
	    
	    for (var idx in ass) {
		var a = ass[idx];
		if (!(a.username in count)) {
		    count[a.username] = 1
		    nb ++;
		}
	    }
	    
	    res.setHeader('Content-Type', 'application/json');
	    res.end(JSON.stringify({nb}));
    });
}

exports.submissionsbydate = function(req, res) {
    protectAdmin(req, res);

    const sincedate = constructSince(req);
    const untildate = constructUntil(req);

    const anonimize = true
    
    SubmissionLog.find({$and: [ { dateCreated: {$lt: untildate} }, //in the right time window
			     { dateCreated: {$gt: sincedate} }
			   ]})
	.then(function (submissions) {

	    if (anonimize) {
		for (var a in submissions) {
		    var sub = submissions[a];
		    
		    //anonymize username
		    var shasum = crypto.createHash('sha256');
		    shasum.update(sub.username);
		    sub.username = shasum.digest('hex');
		    
		    //anonymoize email per component (to retain school)
		    var spl = sub.email.split('@');
		    
		    var pre = spl[0];
		    shasum = crypto.createHash('sha256');
		    shasum.update(pre);
		    pre = shasum.digest('hex');
		    
		    var post = spl[1];
		    shasum = crypto.createHash('sha256');
		    shasum.update(post);
		    post = shasum.digest('hex');
		    
		    sub.email=pre+"@"+post		
		}
	    }	    
	    res.setHeader('Content-Type', 'application/json');
	    res.end(JSON.stringify(submissions));
    });
}

