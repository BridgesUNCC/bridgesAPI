var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Account = mongoose.model('Account'),
    Assignment = mongoose.model('Assignment'),
    crypto = require('crypto'),
    mail = require('./mail');

//Setup for logging in via twitter
var login = function (req, res) {
    if (req.session.returnTo) {
        res.redirect(req.session.returnTo);
        delete req.session.returnTo;
        return;
    }
    return res.redirect('/');
};

exports.authCallback = login;
exports.session = login;

/**
 * GET
 * Renders the BRIDGES homepage.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 */
exports.index = function (req, res) {
  var user = req.user || "";

  res.render('home/index', {
      title: 'Index',
      user: user,
      message: req.flash("errMsg")
  });
};

/**
 * GET
 * Renders the login page.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 */
exports.login = function (req, res) {
  var user = req.user || "";

  res.render("users/login", {
      title: 'Login',
      user: user,
      message: req.flash('loginMessage')
 });
};

/**
 * GET
 * Renders the forgot password form page.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 */
exports.forgot = function (req, res) {
  var user = req.user || "";

  res.render("users/forgot", {
    title: 'Forgot Password',
    user: user
  });
};

/**
 * POST
 * Handles the password reset process after the user submits the new password.
 * Finds the user by token and updates the password if the token is valid and not expired.
 * @param {object} req - The request object containing the token and new password.
 * @param {object} res - The response object.
 */
exports.resetPassword = function(req, res) {
  var findthis = crypto.createHash('sha512').update(req.params.token).digest('hex');

  // Find the user with the valid unique token
  User.findOne({'password_reset.reset_token': findthis,
                'password_reset.reset_timeout': {$gte: new Date()}
  }).then(function (user) {
    // if the token is invalid or expired, alert the user
    if( !user) {
      res.render("users/noreset", {
        title: 'Cannot Reset'
      });
    } else {
      // otherwise, update the password
      user.password = req.body.password1;

      // remove the token
      user.password_reset = undefined;

      // save the user model
	user.save()
	    .then(function(user) {
                // finally, ask the user to login with their new password
		res.send(200, {"redirect": '/login'});
	    })
	    .catch (err => {
		console.log(err);
		return res.render("users/noreset", {
		    title: 'Cannot Reset'
		});
	    });
    }
  })
	.catch(err => {
	    res.render("users/noreset", {
		title: 'Cannot Reset'
	    });
	});
};

/**
 * POST
 * Renders the password reset form if the token is valid and not expired.
 * @param {object} req - The request object containing the token.
 * @param {object} res - The response object.
 */
exports.getNewPassword = function(req, res) {
  var findthis = crypto.createHash('sha512').update(req.params.token).digest('hex');

  // Find the user with the valid unique token
  User.findOne({'password_reset.reset_token': findthis,
                'password_reset.reset_timeout': {$gte: new Date()}
	       })
	.then(function (user) {
	    // if the token is invalid or expired, alert the user
	    if(!user) {
	    } else {
		// otherwise, render the reset page
		res.render("users/reset", {
		    title: 'Reset Password',
		    token: req.params.token
		});
	    }
	})
	.catch(err => {
	    res.render("users/noreset", {
		title: 'Cannot Reset'
	    });
	});
};

/**
 * POST
 * Sends a password reset email containing a token to the user.
 * @param {object} req - The request object containing the user's email.
 * @param {object} res - The response object.
 */
exports.sendResetEmail = function (req, res) {
  var email = req.body.email;

  // Find the user with the given email address
  User.findOne({ 'email': email }).then(function (user) {
      if(user === null) {
	  res.status(400).json({"error": email + " is not associated with a Bridges account. Please try again:"});
    } else {
      // pass the email address to generate the email
      mail.resetPass(email, function(err, email, token) { //MONGOOSE7 ????
        if(err) {
          console.log(err);
          return res.status(400).json({"error": "Email could not be sent at this time. Please try again:"});
        }

        // store the token (and expiry datetime) in user model
        user.setToken(token, function(err) { //MONGOOSE7 ????
          if(err) {
            console.log(err);
            return res.status(400).json({"error": "Token could not be saved. Please contact a Bridges administrator."});
          }
          res.status(202).json({"email": email});
        });
      });
    }
  })
	.catch(err => {
	          res.status(400).json({"error": email + " is not associated with a Bridges account. Please try again:"});
	});
};

/**
 * Logs out the current user and destroys the session.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @param {function} next - The next middleware function.
 */
exports.logout = function (req, res) {
    user="";

    if (req.session) {
      // delete session object
      req.session.destroy(function(err) {
        if(err) {
          return next(err);
        }
      });
    }
    res.redirect("/");
};

/**
 * Loads and renders the user's profile page.
 * @param {object} req - The request object containing user information.
 * @param {object} res - The response object.
 */
exports.profile = function (req, res) {
    if (!req.user) return res.redirect("login");

    user = req.user;
    Account
      .findOne({ email : user.email })
      .then(function (accts) {
          if (!accts) accts = new Account();
          return res.render('users/profile', {
              title: user.username + "'s Dashboard - Bridges",
              user: user,
              acct: accts
          });
      })
	.catch(err => {
	    return next(err);
	});
};

/**
 * Deletes a user and all associated assignments and accounts.
 * @param {object} req - The request object containing user information.
 * @param {object} res - The response object.
 * @param {function} next - The next middleware function.
 */
exports.deletePerson = function (req, res) {

    user = req.user;
    console.log("Deleting user: " + user.email);

    //TODO: error handling is weak here. If assignment delete doesn't work then account doesn't get run
    User
        .deleteOne({email: user.email})
        .then(function (resp) {
	    console.log("removing user.");
        })
	.catch(err => {
	    return next(err); //TODO: there is no next function passed here
	});

    Assignment
        .deleteMany({email: user.email})
        .then(function( resp ) {
            console.log("removing assignments.");
        })
	.catch(err => {return next(err);});

    Account
        .deleteMany({email: user.email})
        .then(function( resp) {
	    console.log("removing assignments.");
        })
	.catch(err => {return next(err);});

    return res.redirect("/login");
};

/**
 * Generates and saves a new API key for the current user.
 * @param {object} req - The request object containing user information.
 * @param {object} res - The response object used to send the API key.
 */
exports.getkey = function (req, res) {
    console.log("User: "+req.user.username +"("+req.user.email+")"+
        " requsted a new apikey");
    user = req.user;
    user.generateKey();
    user.save();
    res.send(user.apikey);
};

/**
 * Renders the signup form page.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 */
exports.signup = function (req, res) {
    res.render('users/signup', {
        title: 'Sign up',
        user: new User()
    });
};

/**
 * Creates a new user account from the signup form data.
 * Generates an API key for the new user and logs them in automatically.
 * @param {object} req - The request object containing signup form data.
 * @param {object} res - The response object used for redirection or error handling.
 * @param {function} next - The next middleware function for error handling.
 */
exports.create = function (req, res) {
    var user = new User(req.body);
    user.provider = 'local';
    user.generateKey();
    user.save().then(function (saveddoc) {

        console.log("Creating user: "+ req.body.email);

        // manually login the user once successfully signed up
        req.logIn(user, function(err) {
          if (err) return next(err);
          return res.redirect('/username');
        });
    })
	.catch(err =>{
	    err = err.errors ? err.errors : err;
            return res.render('users/signup', {
		errors: (err),
		user: user,
		title: 'Sign up'
            });
	});
};

/**
 * Sets the institution name for the current user.
 * @param {object} req - The request object containing the institution name.
 * @param {object} res - The response object.
 */
exports.setInstitution = function (req, res) {
  // TODO: clean insitution_name
  req.user.institution_name = req.body.institution;
    req.user.save()
	.then(function(user) {
            return res.send(200);
	})
	.catch(err => {
	    return res.send(501);
	});
};

/**
 * Sets the course name for the current user.
 * @param {object} req - The request object containing the course name.
 * @param {object} res - The response object.
 */
exports.setCourse = function (req, res) {
  // TODO: clean course_name
  req.user.course_name = req.body.course;
    req.user.save()
    .then(function(user) {
        return res.send(200);
    })
	.catch(err =>{
	    return res.send(501);
	});
};
