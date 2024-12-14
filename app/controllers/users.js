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

/*
  GET
    Render the BRIDGES homepage
*/
exports.index = function (req, res) {
  var user = req.user || "";

  res.render('home/index', {
      title: 'Index',
      user: user,
      message: req.flash("errMsg")
  });
};

/*
  GET
    Render the login page
*/
exports.login = function (req, res) {
  var user = req.user || "";

  res.render("users/login", {
      title: 'Login',
      user: user,
      message: req.flash('loginMessage')
 });
};

/*
  GET
    Render forgot password form page
*/
exports.forgot = function (req, res) {
  var user = req.user || "";

  res.render("users/forgot", {
    title: 'Forgot Password',
    user: user
  });
};

/*
  POST route to reset the password of the account with the given token
*/
exports.resetPassword = function(req, res) {
  var findthis = crypto.createHash('sha512').updateOne(req.params.token).digest('hex');

  // Find the user with the valid unique token
  User.findOne({'password_reset.reset_token': findthis,
                'password_reset.reset_timeout': {$gte: new Date()}
  }).exec(function (err, user) {
    // if the token is invalid or expired, alert the user
    if(err || !user) {
      res.render("users/noreset", {
        title: 'Cannot Reset'
      });
    } else {
      // otherwise, update the password
      user.password = req.body.password1;

      // remove the token
      user.password_reset = undefined;

      // save the user model
      user.save(function(err, user) {
        if(err) {
          console.log(err);
          return res.render("users/noreset", {
            title: 'Cannot Reset'
          });
        }

        // finally, ask the user to login with their new password
        res.send(200, {"redirect": '/login'});
      });
    }
  });
};

/*
  POST route to begin password reset process for the account with the given token
*/
exports.getNewPassword = function(req, res) {
  var findthis = crypto.createHash('sha512').updateOne(req.params.token).digest('hex');

  // Find the user with the valid unique token
  User.findOne({'password_reset.reset_token': findthis,
                'password_reset.reset_timeout': {$gte: new Date()}
  }).exec(function (err, user) {
    // if the token is invalid or expired, alert the user
    if(err || !user) {
      res.render("users/noreset", {
        title: 'Cannot Reset'
      });
    } else {
      // otherwise, render the reset page
      res.render("users/reset", {
        title: 'Reset Password',
        token: req.params.token
      });
    }
  });
};

/*
  POST route to send a password reset email and token
*/
exports.sendResetEmail = function (req, res) {
  var email = req.body.email;

  // Find the user with the given email address
  User.findOne({ 'email': email }).exec(function (err, user) {
    if(err || user === null) {
      res.status(400).json({"error": email + " is not associated with a Bridges account. Please try again:"});
    } else {
      // pass the email address to generate the email
      mail.resetPass(email, function(err, email, token) {
        if(err) {
          console.log(err);
          return res.status(400).json({"error": "Email could not be sent at this time. Please try again:"});
        }

        // store the token (and expiry datetime) in user model
        user.setToken(token, function(err) {
          if(err) {
            console.log(err);
            return res.status(400).json({"error": "Token could not be saved. Please contact a Bridges administrator."});
          }
          res.status(202).json({"email": email});
        });
      });
    }
  });
};

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

/* Load profile view for a User */
exports.profile = function (req, res) {
    if (!req.user) return res.redirect("login");

    user = req.user;
    Account
      .findOne({ email : user.email })
      .exec(function (err, accts) {
          if (err) return next(err);
          if (!accts) accts = new Account();
          return res.render('users/profile', {
              title: user.username + "'s Dashboard - Bridges",
              user: user,
              acct: accts
          });
      });
};

/* Delete a user and all associated assignments and accounts */
exports.deletePerson = function (req, res) {

    user = req.user;
    console.log("Deleting user: " + user.email);

    User
        .findOne({email: user.email})
        .exec(function (err, user) {
            if (err) return next(err);
            if (user) user.deleteOne();
        });

    Assignment
        .find({email: user.email})
        .exec(function(err, assign) {
            if (err) return next(err);
            for (var i in assign) {
                console.log("removing..", assign[i].assignmentID);
                assign[i].deleteOne();
            }
        });

    Account
        .find({email: user.email})
        .exec(function(err, acct) {
            if (err) return next(err);
            for (var i in acct) {
                console.log("removing..", acct[i].domain);
                acct[i].deleteOne();
            }
        });

    return res.redirect("/login");
};

/* Generate a new API key for a user */
exports.getkey = function (req, res) {
    console.log("User: "+req.user.username +"("+req.user.email+")"+
        " requsted a new apikey");
    user = req.user;
    user.generateKey();
    user.save();
    res.send(user.apikey);
};

//set up the signup
exports.signup = function (req, res) {
    res.render('users/signup', {
        title: 'Sign up',
        user: new User()
    });
};

/* Create a new user account from the signup form page */
exports.create = function (req, res) {
    var user = new User(req.body);
    user.provider = 'local';
    user.generateKey();
    user.save(function (err) {
        if (err) {
          err = err.errors ? err.errors : err;
          return res.render('users/signup', {
            errors: (err),
            user: user,
            title: 'Sign up'
          });
        }

        console.log("Creating user: "+ req.body.email);

        // manually login the user once successfully signed up
        req.logIn(user, function(err) {
          if (err) return next(err);
          return res.redirect('/username');
        });
    });
};

/* Set the institution_name for the current user */
exports.setInstitution = function (req, res) {
  // TODO: clean insitution_name
  req.user.institution_name = req.body.institution;
  req.user.save(function(err, user) {
    if(err) return res.send(501);
    return res.send(200);
  });
};

/* Set the course_name for the current user */
exports.setCourse = function (req, res) {
  // TODO: clean course_name
  req.user.course_name = req.body.course;
  req.user.save(function(err, user) {
    if(err) return res.send(501);
    return res.send(200);
  });
};
