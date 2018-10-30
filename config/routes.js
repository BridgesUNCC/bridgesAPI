var mongoose = require('mongoose'),
    User = mongoose.model('User');

module.exports = function(app, passport, streamable) {

    //Allows users to by pass authentication to api requests
    //if they have a valid api key.
    var hasAccess = function(req, res, next) {
        //authenticated
        if (req.isAuthenticated()) {
            return next();
        }

        var apikey = req.query.apikey;
        if (!apikey) {
          return res.json(401, {
              "error": "Not logged in: you must provide an apikey as a query variable"
          });
        }
        var username = req.query.username;
        if (!username) {
          return res.json(401, {
              "error": "Not logged in: you must provide a username as a query variable"
          });
        }
        User
          .findOne({
              apikey: apikey,
              username: username
          })
          .exec(function(err, user) {
              if (!user) {
                return res.json(401, {
                    "error": "your api key or username is invalid"
                });
              }
              req.user = user;
              return next();
          });
    };

    //authentication
    var isLoggedIn = function(req, res, next) {
        if (req.isAuthenticated()){
            return next();
        }
        res.redirect("/login");
    };

    var isLoggedInGallery = function(req, res, next) {
        if (req.isAuthenticated()){
            return res.redirect("/username/"+req.user.username);
        }
        res.redirect("/login");
    };

    var handleError = function(err, req, res, next) {
        var msg = {};

        //if provided an object
        if (err.tip) msg.tip = err.tip;
        else if (err.err) msg.error = err.err;
        else if(err.message) msg.error = err.message;
        else msg.error = err;

        return res.json(500, msg);
    };

    // -------------------------------------------------------
    //
    //  User Routes
    //
    // -------------------------------------------------------
    var users = require('../app/controllers/users');

    /* Render the BRIDGES homepage, checking for user session */
    app.get('/', users.index);

    /* Send the signup page */
    app.get('/signup', users.signup, handleError);

    /* Creating a new user */
    app.post('/users', users.create, handleError);

    /* Render the login page */
    app.get('/login', users.login, handleError);

    // allow user to request a password reset email
    app.get('/forgot', users.forgot, handleError);

    // send a password reset email
    app.post('/forgot', users.sendResetEmail, handleError);

    // allow user to set new password
    app.get('/reset/:token', users.getNewPassword, handleError);

    // reset a user's password
    app.post('/reset/:token', users.resetPassword, handleError);

    /* User's personal profile */
    app.get('/profile', isLoggedIn, users.profile, handleError);

    /* User's personal gallery; requires log in */
    app.get('/username', isLoggedInGallery, users.profile, handleError);

    app.delete('/users/:id', isLoggedIn, users.deletePerson);
    app.get('/users/apikey', users.getkey, handleError);
    app.get('/logout', users.logout);

    /* User may add institution and course names */
    app.post('/users/setInstitution', users.setInstitution, handleError);
    app.post('/users/setCourse', users.setCourse, handleError);

    /* Set up a user session on login */
    app.post('/users/session',
        passport.authenticate('local-log', {
            successRedirect: '/username/',
            failureRedirect: '/login',
            failureFlash: true
        }));

    // -------------------------------------------------------
    //
    //  Stream Routes
    //
    // -------------------------------------------------------
    var streams = require('../app/controllers/streams.js');

    app.get('/streams/:domain/*',
        hasAccess, streamable, streams.getSource, handleError);
    app.get('/streams/:domain',
        hasAccess, streamable, streams.getSource, handleError);



    // -------------------------------------------------------
    //
    //  Assignment Routes
    //
    // -------------------------------------------------------
    var assignments = require('../app/controllers/assignments.js');

    /* Upload an assignment */
    app.post('/assignments/:assignmentID',
        hasAccess, assignments.upload, handleError);

    /* Toggle assignment publicity */
    app.post('/assignments/:assignmentNumber/share/:value',
        hasAccess, assignments.updateVisibility, handleError);

    //app.get('/assignments/:assignmentID/:username',
    //         isPublic, assignments.show, handleError)

    /* Allow user to save a snapshot of the positions of a graph */
    app.post('assignments/:assignmentNumber/saveSnapshot/',
              hasAccess, assignments.saveSnapshot, handleError);

    app.get('/assignments/:assignmentNumber/:username',
              assignments.show, handleError);
    app.get('/assignmentByEmail/:assignmentID/:email',
              assignments.assignmentByEmail, handleError);
    app.get('/assignmentJSON/:assignmentNumber/:username',
              assignments.getJSON, handleError);

    // update the assignment specified for the current user
    //  save the positions of any fixed nodes
    app.post('/assignments/updatePositions/:assignmentNumber', isLoggedIn, assignments.savePositions);

    // update the assignment specified for the current user
    //  save all the transformations for all subAssignments.
    app.post('/assignments/updateTransforms/:assignmentNumber', isLoggedIn, assignments.updateTransforms);

    // delete the assignment specified for the current user
    app.delete('/assignments/:assignmentNumber', isLoggedIn, assignments.deleteAssignment);


    // -------------------------------------------------------
    //
    //  Gallery Routes
    //
    // -------------------------------------------------------
    var gallery = require('../app/controllers/gallery.js');      // Public gallery
    var userGallery = require('../app/controllers/userGallery.js');  // Private user gallery

    app.get('/assignments/:assignmentNumber', gallery.view, handleError);

    /* User's gallery; does not require log in */
    app.get('/username/:userNameRes', userGallery.view, handleError);

    // get the k most recent assignments
    app.get('/index/recentUploads', gallery.recentUploads, handleError);

    // -------------------------------------------------------
    //
    //  Search Routes
    //
    // -------------------------------------------------------

    app.post('/search/', function(req, res, next) {
        var id = req.body.assignmentID;
        res.redirect('/assignments/'+id);
    });


    app.get('/search/:searchTerm', function(req, res) {
        //console.log(parseFloat(req.params.searchTerm), typeof parseFloat(req.params.searchTerm))
        res.redirect('/assignments/'+req.params.searchTerm);
    });



    // -------------------------------------------------------
    //
    //  Authentication Routes
    //
    // -------------------------------------------------------

    app.get('/connect/twitter',
        passport.authorize('twitter-authz', {
            failureRedirect: '/login'
        })
    );

    app.get('/auth/twitter/callback',
        passport.authorize('twitter-authz', {
            failureRedirect: '/login'
        }),
        function(req, res) {
            var user = req.user;
            var account = req.account;
            // Associate the Twitter account with the logged-in user.
            account.email = user.email;
            account.save(function(err) {
                if (err) return (err);
                res.redirect('/home');

            });
        }
    );

};
