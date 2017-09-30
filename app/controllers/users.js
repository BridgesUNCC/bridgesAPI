var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Account = mongoose.model('Account'),
    Assignment = mongoose.model('Assignment'),
    crypto = require('crypto'),
    mail = require('./mail');

//Setup for logging in via twitter
var login = function (req, res) {
    if (req.session.returnTo) {
        res.redirect(req.session.returnTo)
        delete req.session.returnTo
        return
    }
    return res.redirect('/home')
}

exports.authCallback = login
exports.session = login



exports.index = function (req, res) {
    if (!user) var user
    if (req.user)
        user = req.user
    else
        var user = ""
    res.render('home/index', {
        title: 'Index',
        user: user

    })
}

exports.login = function (req, res) {
    if (!user) var user
    if (req.user)
        user = req.user
    else
        var user = ""

    msg = req.flash('loginMessage')

    res.render("users/login", {
        title: 'Login',
        user: user,
        message: msg
   })

}

exports.forgot = function (req, res) {
  if (!user) var user;
  if (req.user)
      user = req.user;
  else
      var user = "";

  res.render("users/forgot", {
    title: 'Forgot Password',
    user: user
  });
};

/*
  POST route to reset the password of the account with the given token
*/
exports.resetPassword = function(req, res) {
  var findthis = crypto.createHash('sha512').update(req.params.token).digest('hex');

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
  var findthis = crypto.createHash('sha512').update(req.params.token).digest('hex');

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
    req.logout()
    user=""
    res.redirect("login")
}

exports.display = function (req, res) {
    //console.log("DISPLAY");
    if (!req.user) return res.redirect("login")

    user = req.user
    Account
        .findOne({ email : user.email })
        .exec(function (err, accts) {
            if (err) return next(err)
            if (!accts) accts = new Account
            return res.render('users/index', {
                title: user.username + "'s Dashboard - Bridges",
                user: user,
                acct: accts
            })
        })

}


exports.profile = function (req, res) {
    //console.log("DISPLAY");
    if (!req.user) return res.redirect("login")

    user = req.user
    Account
        .findOne({ email : user.email })
        .exec(function (err, accts) {
            if (err) return next(err)
            if (!accts) accts = new Account
            return res.render('users/profile', {
                title: user.username + "'s Dashboard - Bridges",
                user: user,
                acct: accts
            })
        })

}

exports.view = function(req, res) {

    var getAssignments = function(assig, assignmentsRes, cb) {
        if (assig.length == 0) return cb(assignmentsRes)
            var assID = assig.pop()
            Assignment
                .findOne({
                         "assignmentID": assID
                 })
                .exec(function(err, assID) {
                      if (err) return null;
                      if (assID) assignmentsRes.push(assID)
                      getAssignments(assig, assignmentsRes, cb)
                })
    }

    if (!req.params.userNameRes)
        return next("no user name provided")

        Assignment
            .find({
                  email: req.params.userNameRes,
                  //shared: true
              })
            .exec(function(err, assignmentResult) {
                if (err) return next(err)

                if (!assignmentResult) return next("could not find " +
                                                 "assignment " + req.params.userNameRes)

                var assig = []
                for (i = 0; i < assignmentResult.length; i++)
                assig.push(assignmentResult[i].assignmentID)

                getAssignments(assig, [], function(assignmentsRes) {

                    return res.render('assignments/userGallery', {
                       "title": "Assignment gallery",
                       "user":req.user,
                       "usernames": req.params.userNameRes,
                       "assignments":assignmentsRes
                    })
                })
            })
}

exports.deletePerson = function (req, res) {

    user = req.user
    console.log("Deleting user: " + user.email)

    User
        .findOne({email: user.email})
        .exec(function (err, user) {
            if (err) return next(err)
            if (user) user.remove()
        })
    Assignment
        .find({email: user.email})
        .exec(function(err, assign) {
            if (err) return next(err)
            for (i in assign) {
                console.log(assign[i].assignmentID)
                assign[i].remove()
            }
        })
    Account
        .find({email: user.email})
        .exec(function(err, acct) {
            if (err) return next(err)
            for (i in acct) {
                console.log(acct[i].domain)
                acct[i].remove()
            }
        })
            return res.redirect("login")
}

exports.getkey = function (req, res) {
    console.log("User: "+req.user.username +"("+req.user.email+")"+
        " requsted a new apikey")
    user = req.user
    user.generateKey()
    user.save()
    res.send(user.apikey)
}



//set up the signup
exports.signup = function (req, res) {
    res.render('users/signup', {
        title: 'Sign up',
        user: new User()
    })
}

exports.create = function (req, res) {
    console.log("Creating user: "+ req.body.email)
    var user = new User(req.body)
    user.provider = 'local'
    user.generateKey()
    user.save(function (err) {
        if (err) {
            return res.render('users/signup', {
                    errors: (err.errors),
                    user: user,
                    title: 'Sign up'
             })
        }

        // manually login the user once successfully signed up
        req.logIn(user, function(err) {
            if (err) return next(err)
                return res.redirect('/')
        })
    })
}

exports.user = function (req, res, next, id) {
    User
        .findOne({ _id : id })
        .exec(function (err, user) {
            if (err) return next(err)
            if (!user) return next(new Error('Failed to load User ' + id))
                req.profile = user
            next()
        })
}
