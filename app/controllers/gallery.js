var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Account = mongoose.model('Account'),
    Assignment = mongoose.model('Assignment'),
    visTypes = require('./visTypes.js');

exports.view = function(req, res) {
    var assignmentNumber;

    var getUsername = function(users, usernames, cb) {
        if (users.length === 0) return cb(usernames);
        var user = users.pop();
        User
            .findOne({
                "email": user
            })
            .exec(function(err, user) {
                if (err) return null;
                if (user) usernames.push(user.username);
                getUsername(users, usernames, cb);
            });
    };

    var getAssignmentsEmailAndUsernameMap = function(users, usernamesmap, cb) {
        if (users.length === 0) return cb(usernamesmap);
        var user = users.pop();
        User
            .findOne({
                "email": user
            })
            .exec(function(err, user) {
                if (err) return null;
                if (user){
                  // usernames.push(user.username)
                  usernamesmap[user.email] = user.username;
                }
                getAssignmentsEmailAndUsernameMap(users, usernamesmap, cb);
            });
    };

    if (!req.params.assignmentNumber) {
      return next("No assignment number given");
    } else {
      assignmentNumber = req.params.assignmentNumber;

      Assignment
          .find({
              assignmentNumber: assignmentNumber,
              subAssignment: "00",
              shared: true
          }, {
              email: 1,
              assignmentID: 1,
              title: 1,
              description: 1,
              assignmentNumber: 1,
              "data.visual": 1,
              "data.dims": 1,
              vistype: 1,
              shared: 1,
              dateCreated: 1,
              _id: 0
          })
          .exec(function(err, assignmentResult) {

              if (err) return next(err);
              if (!assignmentResult) return next("could not find " +
                  "assignment " + req.params.assignmentNumber);

              if(assignmentResult.length === 0) {
                  return res.render('assignments/gallery', {
                      "title": "Assignment gallery",
                      "user":req.user,
                      "assignments": "",
                      "assignmentNumber":-1
                  });
              }

              if(assignmentResult.length <= 0) {
                  return res.redirect('/username/'+req.user.username);
              }

              var users = [];
              for (i = 0; i < assignmentResult.length; i++)
                  users.push(assignmentResult[i].email);

              var usernamesmap = {};
              getAssignmentsEmailAndUsernameMap(users, usernamesmap, function(usernamesmap) {

                try {
                  for(var assignmentResultItem in assignmentResult){
                      assignmentResult[assignmentResultItem]['username'] = usernamesmap[assignmentResult[assignmentResultItem]['email']];
                      var $thisVistype = visTypes.getVisType(assignmentResult[assignmentResultItem]['data'][0]['visual']);
                      if($thisVistype == "Alist") $thisVistype = visTypes.checkIfHasDims(assignmentResult[assignmentResultItem]['data'][0]);
                      assignmentResult[assignmentResultItem]['vistype'] = $thisVistype;
                  }
                } catch (error) {
                    console.log("Error processing assignments. Data may be corrupted. ", error);
                    assignmentResult = [];
                }

                  assignmentResult.sort(function(a, b) {
                      return Date.parse(b.dateCreated) - Date.parse(a.dateCreated);
                      // return parseFloat(a.assignmentID) - parseFloat(b.assignmentID);
                  });

                  return res.render('assignments/gallery', {
                      "title": "Assignment gallery",
                      "user":req.user,
                      "assignmentNumber":req.params.assignmentNumber,
                      "assignments":assignmentResult
                  });
              });
          });
        }
};

exports.recentUploads = function(req, res) {
  Assignment
      .find({
        shared: true,
        subAssignment: "00"
      }, {
          _id: 0,
          email: 1,
          assignmentID: 1,
          title: 1,
          description: 1,
          assignmentNumber: 1,
          assignment_type: 1,
          vistype: 1,
          shared: 1,
          dateCreated: 1
      })
      .sort({"dateCreated": -1})
      .limit(5)
      .exec(function(err, recentAssigns) {
          if (err) return next(err);
          if (!recentAssigns) return next("error obtaining recent assignment data");
          res.send(recentAssigns);
      });

};
