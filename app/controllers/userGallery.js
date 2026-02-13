var mongoose = require('mongoose'),
    Assignment = mongoose.model('Assignment'),
    User = mongoose.model('User'),
    visTypes = require('./visTypes.js');

/**
 * Displays a user's assignment gallery.
 * Retrieves assignments based on the provided username, filtering by shared status if necessary.
 * Sorts assignments by assignmentID.
 * Renders the 'assignments/userGallery' template with the retrieved assignments and user information.
 * @param {object} req - The request object containing user information and username parameter.
 * @param {object} res - The response object used to render the gallery view.
 * @param {function} next - The next middleware function for error handling.
 */
exports.view = function(req, res, next) {
    
    User.findOne({
	username: req.params.userNameRes
    })
	.then (function(user){
	    if(!user) {
		req.flash("errMsg", "User not found!");
		return res.redirect("/");
	    }
	    
	    var findConditions = {
		email: user.email,
		subAssignment: "00"
	    };
	    
	    // if this is not my own gallery, only view shared assignments
	    if(!req.user || (req.user && (req.user.email != user.email))) {
		findConditions.shared = true;
	    }
	    
	    Assignment
		.find(findConditions, {
		    _id: 0,
		    assignmentID: 1,
		    title: 1,
		    description: 1,
		    assignmentNumber: 1,
		    vistype: 1,
		    assignment_type: 1,
		    shared: 1,
		    dateCreated: 1,
		    username: 1
		})
            //Do we want to load every single whole number assignment, or just some? Query might be time intensive.
            // .limit( 25 )
		.then(function(assignmentResult) {
		    if (!assignmentResult) return next("could not find " + "assignment " + req.params.userNameRes);
		    
		    // sort on assignment ID since assignmentID could be String
		    assignmentResult.sort(function(a, b) {
			return parseFloat(a.assignmentID) - parseFloat(b.assignmentID);
		    });
		    //sort on assignement Creation Date. I think sorting based on the date is also important.
		    // assignmentResult.sort(function(a, b) {
		    //     return Date.parse(b.dateCreated) - Date.parse(a.dateCreated);
		    // });
		    
		    return res.render('assignments/userGallery', {
			"title": "Assignment gallery",
			"user":req.user,
			"usernames": user.username,
			"assignments":assignmentResult
		    });
		}).
		catch (err => {
		  return next(err);
		});
	})
	.catch (err => {
	    return next(err);
	});
};
