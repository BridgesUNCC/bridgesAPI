var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Account = mongoose.model('Account'),
    Assignment = mongoose.model('Assignment'),
    treemill = require('treemill'),
    visTypes = require('./visTypes.js');

//API route to toggle the visibility of an assignment
//between private and public.
exports.updateVisibility = function (req, res, next) {

    Assignment
        .find({
            email:req.user.email,
            assignmentNumber: req.params.assignmentNumber
        })
        .exec(function (err, assignmentResult) {
            if(err) console.log(err);

            for(var i = 0; i < assignmentResult.length; i++) {
              if (err) return next(err);
              if (!assignmentResult[i])
                  return next("could not find assignment");
              assignmentResult[i].shared=req.params.value;
              assignmentResult[i].save();
              //console.log("CHANGED TO " + req.params.value + " " + assignmentResult[i]);
            }
            res.send("OK");

        });
};

//API route to save the position of some (or all) node positions
exports.saveSnapshot = function(req, res, next) {
    Assignment
        .findOne({
            email:req.user.email,
            assignmentNumber: req.params.assignmentNumber
        })
        .exec(function (err, assignmentResult) {
            if (err) return next(err);
            if (!assignmentResult)
                return next("could not find assignment");
            console.log("snapshot");
            //Save JSON with modified positions
            //assignmentResult.save()
            //res.send("OK")
        });
};

//API route for uploading assignment data. If the
//assignment already exists it will be replaced.
exports.upload = function (req, res, next) {
    // C++ version posts JSON as object, JAVA and Python post as plain string
    if(typeof req.body != "object") {
        try { rawBody = JSON.parse(req.body); } // try parsing to object
        catch (e) {
            if(typeof req.body != 'object') {
                return next(e + " invalid syntax for raw body of request");
            } else {
                rawBody = req.body;
            }
        }
    } else {  // object already
        rawBody = req.body;
    }

    // Handle assignment number
    var assignmentID = req.params.assignmentID;
    var assignmentRaw = assignmentID.split(".");
    var assignmentNumber = assignmentRaw[0];
    var subAssignment = assignmentRaw[1];
    if (subAssignment == "0") subAssignment = "00";

    console.log(rawBody);

    // validate attributes
    var title = rawBody.title || "";
    var description = rawBody.description || "";
    var display_mode = rawBody.display_mode || "slide";

    // set correct vistype
    var assignmentType = rawBody.visual;
    var visualizationType = visTypes.getVisType(assignmentType);
    if(visualizationType == "Alist") {
      visualizationType = visTypes.checkIfHasDims(rawBody);
    }

    // make sure grid-based assignments do not exceed hard dimension limits
    if(rawBody.dimensions) {
      if((rawBody.dimensions[0] && rawBody.dimensions[0] > 1080) ||
         (rawBody.dimensions[1] && rawBody.dimensions[1] > 1920)) {
           return next("Illegal Grid Dimensions");
      }
    }

    //get username from apikey
    User.findOne({
        apikey:req.query.apikey
    })
    .exec(function (err, user) {
        if (err) return next (err);
        if (!user) return next ("could not find user by apikey: " + req.query.apikey);

        //if username found, upload or replace
        replaceAssignment(res, user, assignmentID);
    });

    // if the assignment is new, remove old assignments with the same ID
    function replaceAssignment (res, user, assignmentID) {

        if (subAssignment == '0' || subAssignment == '00') {
             Assignment.deleteMany({
                assignmentNumber: assignmentNumber,
                email: user.email
            })
            .exec(function (err, resp) {
                 if(err)
                    console.log(err);
                console.log("replaceAssignment() removed assignments (" + assignmentNumber + ".*) from user: \"" + user.username + "\"");
                saveAssignment(user, assignmentNumber);
            });
        } else {
          saveAssignment(user, assignmentNumber);
        }
    }

    // save the assignment to the DB
    function saveAssignment(user, assignmentNumber) {

      assignment = new Assignment();

      // set the title and description
      assignment.title = title;
      assignment.description = description;

      // set the user credentials
      assignment.username = user.username;
      assignment.email = user.email;

      // set visualization type
      assignment.vistype = visualizationType;

      // set assignment type
      assignment.assignment_type = assignmentType;
      assignment.display_mode = display_mode;

      // set assignment identifiers
      assignment.assignmentID = assignmentID;
      assignment.assignmentNumber = assignmentNumber;
      assignment.subAssignment = subAssignment;

      // remove attributes from data attribute
      delete rawBody.title;
      delete rawBody.description;
      delete rawBody.visual;
      delete rawBody.vistype;

      // save assignment data
      assignment.data = rawBody;

      assignment.save(function (err, product, numAffected) {
        if (err) {
          // trap errors saving the assignment to the DB
          console.log(err);
          next(err);
        } else {
          User.findOne({
              email: user.email
          }).exec(function (err, resp) {
              res.json( 200, { "msg":assignmentID + "/" + resp.username } );
          });
          console.log( "subassignment added" );
        }
      });
    }
};

exports.next = null;

/*
 *  Get the raw JSON for an assignment
 */
exports.getJSON = function (req, res, next) {
    this.next = next;
    var assignmentRaw = req.params.assignmentNumber.split('.'),
        username = req.params.username,
        sessionUser = null,
        assignmentNumber = assignmentRaw[0],
        subAssignmentNumber = "00";

    // if subassignment specified
    if(assignmentRaw.length > 1) {
      subAssignmentNumber = assignmentRaw[1];
      if (subAssignmentNumber == "0") subAssignmentNumber = "00";
    }

    if (typeof req.user != "undefined") sessionUser = req.user;

    User
        .findOne( { username: username } )
        .exec( function( err, usr ){
            if (err) return next(err);
            if (!usr)
                return res.status(404).render("404", {"message": "couldn't find the username \'" + username + "\'"});

            Assignment.findOne({
                email: usr.email,
                assignmentNumber: assignmentNumber,
                subAssignment: subAssignmentNumber
            }, {
              "__v": 0,
              "_id": 0
            })
            .lean()
            .exec( function(err, assignment) {
              if (err) return next(err);
              if (!assignment) {
                  return res.status(404).render("404", {"message": "can not find assignment " + assignmentNumber + "." + subAssignmentNumber + " for user \'" + username + "\'"});
                }

              // add new resource info to assignment json
              assignment.resources = {'script': [], 'css': []};

              // add visualization resources if appropriate
              var resources = visTypes.getVisTypeObject(assignment);
              if(resources.script) {
                assignment.resources.script.push(resources.script);
              }
              if(resources.link) {
                assignment.resources.css.push(resources.link);
              }

              // add map resources if appropriate
              if(assignment.data[0] && assignment.data[0].map_overlay) {
                assignment.resources.script.push('/js/map.js');
                assignment.resources.script.push('/js/lib/topojson.v1.min.js');
                assignment.resources.css.push('/css/map.css');
              }

              // return the found assignment if it's public or owned by the request
              if(assignment.shared || (sessionUser && (assignment.email == sessionUser.email)))
                return res.json( 200, assignment );

              return res.status(404).render("404", {"message": "can not find public assignment " + assignmentNumber + "." + subAssignmentNumber + " for user \'" + username + "\'"});
            });
        });
};

/*
 *  Get and render an assignment
 *    Assignments can be displayed in slide or stack mode
 */
exports.get = function (req, res, next) {
    this.next = next;
    var assignmentNumber = req.params.assignmentNumber.split('.')[0],
        username = req.params.username,
        sessionUser = null;

    if (typeof req.user != "undefined") sessionUser = req.user;

    var apikey = (sessionUser) ? req.query.apikey : null;

    User
        .findOne( { username: username } )
        .exec( function( err, usr ){
            if (err) return next(err);
            if (!usr)
                return next("couldn't find the username " + username);

            Assignment.findOne({
                email: usr.email,
                assignmentNumber: assignmentNumber,
                subAssignment: "00"
            }, {
              "__v": 0,
              "_id": 0
            })
            .lean()
            .exec(function(err, assignment) {
                if (err) return next(err);

                if (!assignment || assignment.length === 0) {
                    return next ("assignment " + assignmentNumber + " was not found");
                }

                // render the assignment if it's public or owned by the request
                if(assignment.shared || (sessionUser && (assignment.email == sessionUser.email))) {
                  // get the count of total subassignments
                  Assignment.countDocuments({
                    email: usr.email,
                    assignmentNumber: assignmentNumber
                  }).exec(function(err, num) {
                    if(err) return next(err);
                    assignment.numSubassignments = num;
                    return renderVis(res, assignment);
                  });
                } else {
                  return next("can not find public assignment " + assignmentNumber + " for user \'" + username + "\'");
                }
            });
        });

    function renderVis (res, assignment) {
        var owner=false,
            map=false,
            assignmentType = {},
            linkResources = {"script":[], "css":[]},
            navItems = {}; // optional nav buttons: labels, save positions

        if (sessionUser) {
            if (sessionUser.email==assignment.email) owner = true;
        }

        var unflatten = function (data) {
            //check whether the data is already hierachical
            if ("children" in data) return data;
            tm = treemill();
            tree = tm.unflatten(data);
            return tree;
        };

        var flatten = function (data) {
            //check whether the data is already flat
            if ("nodes" in data) return data;
            tm = treemill();
            tree = tm.flatten(data);
            return tree;
        };

        /* parse assignment data */
        try{
          data = assignment.data[0];
        } catch(err) {
          console.log("Error getting data object");
          return next(err);
        }

        if(data === null) {
          console.log("Erroneous data");
          return next("Erroneous data");
        }

        // Client should send trees as hierarchical representation now..
        // This captures the data from the OLD flat tree representation
        if((assignment.visual == "tree") && !("nodes" in data && "children" in data.nodes)) {
          data = unflatten(data);
          if(!navItems.labels) navItems.labels = true;
        }
        // This captures the data from the NEW hierarchical tree representation
        if("nodes" in data && "children" in data.nodes) {
          data = data.nodes;
          if(!navItems.labels) navItems.labels = true;
        }

        // add optional nav buttons where appropriate
        if(assignment.vistype == "nodelink") {
          if(!navItems.save) navItems.save = true;
          if(!navItems.labels) navItems.labels = true;
        } else if(assignment.vistype == "tree") {
          if(!navItems.labels) navItems.labels = true;
        }

        // Use SVG for < 100 nodes, Canvas for > 100
        if(assignment.vistype == "nodelink" && data.nodes && data.nodes.length > 100) {
          assignment.vistype = "nodelink-canvas";
          linkResources.script.push('/js/graph-canvas.js');
        }

        // add new resource info
        if(!assignmentType[assignment.vistype]){
            assignmentType[assignment.vistype] = 1;

            var vistypeObjectTemp = visTypes.getVisTypeObject(assignment);
            linkResources.script.push(vistypeObjectTemp.script);
            if(vistypeObjectTemp.link != ""){
              linkResources.css.push(vistypeObjectTemp.link);
            }
        }

        data.coord_system_type = data.coord_system_type ? data.coord_system_type.toLowerCase() : "cartesian";

        // add map resources if appropriate
        if(assignment.data[0] && assignment.data[0].map_overlay) {
          map = true;
          linkResources.script.push('/js/map.js');
          linkResources.script.push('/js/lib/topojson.v1.min.js');
          linkResources.css.push('/css/map.css');
        }

        sessionUser = sessionUser ? {"username": sessionUser.username, "email": sessionUser.email} : null;

        // add display toggle if >1 assignment
        navItems.toggleDisplay = (assignment.numSubassignments > 1);

        // use display mode specified by query param or assignment
        displayMode = "assignmentSlide"; // default
        if(req.query.displayMode) {
          if(req.query.displayMode == "stack")
            displayMode = "assignmentMulti";
          if(req.query.displayMode == "slide")
            displayMode = "assignmentSlide";
        } else {
          displayMode = (assignment.display_mode == "stack") ? "assignmentMulti" : "assignmentSlide";
        }

        console.log(assignment, assignment.map_overlay);

        return res.render ('assignments/' + displayMode, {
            "user": sessionUser,
            "assignment": assignment,
            "map": map,
            "assignmentNumber":assignmentNumber,
            "linkResources":linkResources,
            "shared":assignment.shared,
            "owner":owner,
            "navItems": navItems,
            "displayMode": (displayMode == "assignmentMulti") ? "stack" : "slide"
        });
      }
  };

/* Copy and paste JSON data to test assignment upload */
exports.testJSON = function (req, res, next) {
    console.log('test JSON data for assignment upload');
    // this.next = next;

    var owner=false,
        allAssigns = {},

    // Add test JSON here
    JSONdata = {"visual":"BinarySearchTree","nodes":[{"color":[255,0,255,255],"shape":"circle","size":10,"name":"Hi","key":"5.4","children":[{"linkProperties":{"color":[0,0,0,255],"thickness":1.000000},"color":[0,255,0,255],"shape":"circle","size":10,"name":"Hello","key":"1.4","children":[{"name":"NULL"},{"name":"NULL"}]},{"linkProperties":{"color":[0,0,0,255],"thickness":1.000000},"color":[0,255,0,255],"shape":"circle","size":10,"name":"World","key":"1.12","children":[{"name":"NULL"},{"linkProperties":{"color":[0,0,0,255],"thickness":1.000000},"color":[0,255,0,255],"shape":"circle","size":10,"name":"World","key":"4.3","children":[{"name":"NULL"},{"name":"NULL"}]}]}]}]};

    return res.render ('assignments/assignmentMulti', {
        "title":"testJSON",
        "user":"test",
        "data":[JSONdata.nodes[0]],
        "extent":1,
        "assignmentNumber":1,
        "vistype":"tree",
        "shared":false,
        "owner":"test"
    });

  };

/* Update the node positions of the given assignment and its subassignments */
exports.savePositions = function(req, res) {
    Assignment
        .find({
          "assignmentNumber": req.params.assignmentNumber,
          "email": req.user.email,
          "vistype": "nodelink"
        })
        .exec(function(err, assign) {
            if (err) return next(err);
            var subassigns = Object.keys(req.body);
            var thisAssign;

            try {
              // handle each sub assignment with nodes
              for(var i in subassigns) {
                i = subassigns[i]; // this is the subassignment number

                // find the right subAssignment index to update
                for(var a in assign) {
                  if(i < 10) thisAssign = "0" + i;
                  else thisAssign = "" + i;
                  if(thisAssign == assign[a].subAssignment) thisAssign = a;
                }

                if(req.body[i].fixedNodes) {
                  // update all fixed nodes
                  for(var j in req.body[i].fixedNodes) {
                    n = +j.slice(1);
                    // set the relevant nodes to be fixed
                    assign[thisAssign].data[0].nodes[n].fixed = true;
                    assign[thisAssign].data[0].nodes[n].fx = +req.body[i].fixedNodes[j].x;
                    assign[thisAssign].data[0].nodes[n].fy = +req.body[i].fixedNodes[j].y;
                    delete assign[thisAssign].data[0].nodes[n].location;
                  }
                }
                if(req.body[i].unfixedNodes) {
                  // update all unfixed nodes
                  for(var j in req.body[i].unfixedNodes) {
                    n = +j.slice(1);
                    delete assign[thisAssign].data[0].nodes[n].fixed;
                    delete assign[thisAssign].data[0].nodes[n].fx;
                    delete assign[thisAssign].data[0].nodes[n].fy;
                    delete assign[thisAssign].data[0].nodes[n].location;
                  }
                }
                // save the updated data
                assign[thisAssign].markModified('data'); //http://mongoosejs.com/docs/faq.html
                assign[thisAssign].save();
              }
            } catch (error) {
              console.log(error);
            }
        });
    res.send("OK");
};

/* Save the zoom and translation for the given assignment */
exports.updateTransforms = function(req, res) {
    Assignment
        .find({
          "assignmentNumber": req.params.assignmentNumber,
          "email": req.user.email
        })
        .exec(function(err, assign) {
            if (err) return next(err);

            // // handle each assignment
            for(var i in assign) {
              // ignore if default scale and translation
              if(req.body[i].scale === "1" &&
                  req.body[i].translatex === "0" &&
                  req.body[i].translatey === "0") {
                    continue;
              }

              //update the transform attribute in the data attribute
              assign[i].data[0].transform = req.body[i];

              // save the updated data
              assign[i].markModified('data'); //http://mongoosejs.com/docs/faq.html
              assign[i].save();
            }
        });
    res.send("OK");
};

/* Delete the given assignment for the current user */
exports.deleteAssignment = function (req, res) {
    Assignment
        .find({
          "assignmentNumber": req.params.assignmentNumber,
          "email": req.user.email
        })
        .exec(function(err, assign) {
            if (err) return next(err);
            for (var i in assign) {
                assign[i].remove();
            }
            console.log("Deleted assignment: " + req.params.assignmentNumber, "for user", req.user.email);
        });
    res.send("OK");
};

exports.assignmentByEmail = function (req, res) {
  var email = req.params.email,
      assignment = req.params.assignmentID;

  User
      .findOne( { email: email  } )
      .exec( function( err, usr ){
          if (err) return next(err);
          if (!usr)
              return next("couldn't find the user by email: " + email);

          res.redirect("/assignments/" + assignment + "/" + usr.username);

      });
};
