var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Account = mongoose.model('Account'),
    Assignment = mongoose.model('Assignment'),
    crypto = require('crypto'),
    mail = require('./mail');

/**
 * Ensures that the requesting user has admin rights.
 * Throws an error if the user is not authenticated or lacks admin privileges.
 * @param {object} req - The request object containing user information.
 * @param {object} res - The response object.
 */
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

/**
 * A demo endpoint that returns a simple JSON response.
 * Requires admin privileges.
 * @param {object} req - The request object.
 * @param {object} res - The response object used to send JSON response.
 */
exports.demo = function(req, res) {

    protectAdmin(req, res);

    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ a: 1 }));

}

/**
 * Renders the admin help page. Returns a simple document that show case the different admin features.
 * Requires admin privileges.
 * @param {object} req - The request object.
 * @param {object} res - The response object used to render the help page.
 */
exports.help = function(req, res) {
    protectAdmin(req, res);
    
    return res.render('admin/help');
}

/**
 * Returns a JSON array of all usernames in the system.
 * Requires admin account.
 * @param {object} req - The request object.
 * @param {object} res - The response object used to send the list of usernames.
 */
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

/**
 * Constructs a date object based on the 'since' query parameter.
 * Defaults to the beginning of the current month if not provided or invalid.
 * @param {object} req - The request object containing the query parameters.
 * @returns {Date} - The constructed date.
 */
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

/**
 * Constructs a date object based on the 'until' query parameter.
 * Defaults to the current time if not provided or invalid.
 * @param {object} req - The request object containing the query parameters.
 * @returns {Date} - The constructed date.
 */
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

/**
 * Returns the number of assignments created within a specified time window.
 * Uses 'since' and 'until' query parameters to define the time range.
 * Requires admin privileges.
 * @param {object} req - The request object containing query parameters.
 * @param {object} res - The response object used to send the assignment count.
 */
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

/**
 * Returns a JSON object with the number of assignments per user in a specified time window.
 * Users with no assignments in the period are excluded.
 * Uses 'since' and 'until' query parameters to define the time range.
 * Requires admin privileges.
 * @param {object} req - The request object containing query parameters.
 * @param {object} res - The response object used to send the user assignment count.
 */
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

/**
 * Returns the number of unique users who have created assignments within a specified time window.
 * Users with no assignments in the period are excluded.
 * Uses 'since' and 'until' query parameters to define the time range.
 * Requires admin privileges.
 * @param {object} req - The request object containing query parameters.
 * @param {object} res - The response object used to send the user count.
 */
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
