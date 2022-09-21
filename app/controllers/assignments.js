var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Account = mongoose.model('Account'),
    Assignment = mongoose.model('Assignment'),
    treemill = require('treemill'),
    visTypes = require('./visTypes.js');
    distype = "";

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
    console.log("assignment upload");
    // C++ version posts JSON as object, JAVA and Python post as plain string
    if(typeof req.body != "object") {
        try { rawBody = JSON.parse(req.body); } // try parsing to object
        catch (e) {
            if(typeof req.body != 'object') {
                return res.status(400).render("404", {"message": e + " Invalid JSON in request body."});
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
    if(visualizationType == "Audio"){
      var display_mode = "audio";
    }

    // Use SVG for < 100 nodes, Canvas for > 100
    if(visualizationType == "nodelink" && rawBody.nodes && rawBody.nodes.length > 100) {
      visualizationType = "nodelink-canvas";
    }

    // make sure grid-based assignments do not exceed hard dimension limits
    if(rawBody.dimensions) {
      if((rawBody.dimensions[0] && rawBody.dimensions[0] > 1080) ||
         (rawBody.dimensions[1] && rawBody.dimensions[1] > 1920)) {
           return res.status(400).render("404", {"message": "Illegal Grid Dimensions: [" + rawBody.dimensions[0] + "," + rawBody.dimensions[1] + "]"});
      }
    }

    console.log("Verifying credentials")
    //get username from apikey
    User.findOne({
        apikey:req.query.apikey
    })
    .exec(function (err, user) {
        if (err) return next (err);
        if (!user) return res.status(401).render("404", {"message": "could not find user by apikey: " + req.query.apikey});

        //if username found, upload or replace
        replaceAssignment(res, user, assignmentID);
    });

    // if the assignment is new, remove old assignments with the same ID
    function replaceAssignment (res, user, assignmentID) {
	console.log( "starting replace assignment" );
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
	console.log("starting to save assignment");
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

	      //A classic error would be that the payload is too big
	      //in which case err is an Error() of type
	      //MongoServerError with codeName BSONObjectTooLarge. We
	      //can trap that first.

	      errorHandled = false;
              if (err.name == "MongoServerError") {
		  if (err.codeName == "BSONObjectTooLarge") {
		      res.status(413).json({"msg": "The volume of data in the assignment is too large for BRIDGES to handle. Try a smaller assignment. For reference, a BRIDGES assignment has to be smaller than about 17MB once serialized to JSON."});
		      errorHandled = true;
		  }
	      }
	      if (! errorHandled) {
		  // No idea what that error is
	      
		  console.log("Error trapped while trying to save assignment : " + err);
		  next(err);
	      }
        } else {
          User.findOne({
              email: user.email
          }).exec(function (err, resp) {
	      console.log( "subassignment added" );
              res.status(200).json({ "msg":assignmentID + "/" + resp.username });
	      
          });

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

              // return the found assignment if it's public or owned by the request
              if(assignment.shared || (sessionUser && (assignment.email == sessionUser.email)))
                return res.status(200).json( assignment );

              return res.status(401).render("404", {"message": "can not find public assignment " + assignmentNumber + "." + subAssignmentNumber + " for user \'" + username + "\'"});
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
                return res.status(404).render("404", {"message": "couldn't find the username " + username});

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
                    return res.status(404).render("404", {"message": "assignment " + assignmentNumber + " was not found"});
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
                  return res.status(401).render("404", {"message": "can not find public assignment " + assignmentNumber + " for user \'" + username + "\'"});
                }
            });
        });

    /*
    function to construct the nessaccary information to render a bridges visualization
    from the assignment information
    */
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

        // add new resource info
        if(!assignmentType[assignment.vistype]){
            assignmentType[assignment.vistype] = 1;

            var vistypeObjectTemp = visTypes.getVisTypeObject(assignment);
            linkResources.script.push(vistypeObjectTemp.script);
            if(vistypeObjectTemp.link != ""){
              linkResources.css.push(vistypeObjectTemp.link);
            }
        }

        //assign the coordsystem type and the area to show. this gets used in map.js/graph.js for deciding projection
        data.coord_system_type = data.coord_system_type ? data.coord_system_type.toLowerCase() : "cartesian";
        //in map.js it picks the area to show from this variable
        data.map = data.map ? data.map : "None";

        // add map resources if appropriate
        if(assignment.data[0] && assignment.data[0].map_overlay) {
          map = true;
          linkResources.script.push('/js/map.js');
          linkResources.script.push('/js/lib/topojson.v1.min.js');
          linkResources.css.push('/css/map.css');
        }


        // add webgl resources if appropriate
        if(assignment.vistype == "graph-webgl" || assignment.vistype == "Audio" || assignment.vistype == 'scene') {
          linkResources.script.push('/webgl/webgl-utils.js');
          linkResources.script.push('/webgl/initShaders.js');
          linkResources.script.push('/webgl/MV.js');
        }

        if(assignment.vistype == 'scene'){
          linkResources.script.push('/js/graphics_engine/camera.js');
          linkResources.script.push('/js/graphics_engine/lighting.js');
          linkResources.script.push('/js/graphics_engine/primitives.js');
          linkResources.script.push('/js/graphics_engine/texture.js');
          linkResources.script.push('/js/graphics_engine/buffer_management/attribute_buffer.js');
          linkResources.script.push('/js/math/Mat2.js');
          linkResources.script.push('/js/math/Mat3.js');
          linkResources.script.push('/js/math/Mat4.js');
          linkResources.script.push('/js/math/sylvester.js');
        }

        sessionUser = sessionUser ? {"username": sessionUser.username, "email": sessionUser.email} : null;

        // add display toggle if >1 assignment
        navItems.toggleDisplay = (assignment.numSubassignments > 1 && assignment.display_mode !== 'audio');

        // use display mode specified by query param or assignment
        displayMode = "assignmentSlide"; // default
        distype = assignment.display_mode
        if(distype == 'stack'){
          displayMode = "assignmentMulti"
        }
        if(distype == 'slide'){
          displayMode = "assignmentSlide"
        }
        if(distype == 'audio'){
          displayMode = "assignmentAudio"
        }
        if(req.query.displayMode) {
          if(req.query.displayMode == "stack"){
            displayMode = "assignmentMulti";
            distype = "stack"
          }
          if(req.query.displayMode == "slide"){
            displayMode = "assignmentSlide";
            distype = "slide"
          }
          if(req.query.displayMode == "audio"){
            displayMode = 'assignmentAudio';
            distype = "audio"
          }
        } else {
          //displayMode = (assignment.display_mode == "stack") ? "assignmentMulti" : "assignmentSlide";
          //distype = assignment.display_mode
        }

        //calls to render the specific view from the app/views folder with the given information
        //this behavior is defined in the config/exrpess.js file on where to render views from
        return res.render ('assignments/' + displayMode, {
            "user": sessionUser,
            "assignment": assignment,
            "map": map,
            "assignmentNumber":assignmentNumber,
            "linkResources":linkResources,
            "shared":assignment.shared,
            "owner":owner,
            "navItems": navItems,
            "displayMode": distype
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
    var subassigns = Object.keys(req.body);

    Assignment
        .find({
          "assignmentNumber": req.params.assignmentNumber,
          "email": req.user.email
        },
        "data subAssignment vistype"
        )
        .or([{"vistype": "nodelink"}, {"vistype": "nodelink-canvas"} ])
        .where('subAssignment')
        .in(subassigns)
        .exec(function(err, assign) {
            if (err) return next(err);

            try {
              // handle each sub assignment with nodes
              for(var i in assign) {
                var sub = assign[i].subAssignment;

                if(req.body[sub].fixedNodes) {
                  // update all fixed nodes
                  for(var j in req.body[sub].fixedNodes) {
                    n = +j.slice(1);
                    // set the relevant nodes to be fixed
                    assign[i].data[0].nodes[n].fixed = true;
                    assign[i].data[0].nodes[n].fx = +req.body[sub].fixedNodes[j].x;
                    assign[i].data[0].nodes[n].fy = +req.body[sub].fixedNodes[j].y;
                    delete assign[i].data[0].nodes[n].location;
                  }
                }
                if(req.body[sub].unfixedNodes) {
                  // update all unfixed nodes
                  for(var j in req.body[sub].unfixedNodes) {
                    n = +j.slice(1);
                    delete assign[i].data[0].nodes[n].fixed;
                    delete assign[i].data[0].nodes[n].fx;
                    delete assign[i].data[0].nodes[n].fy;
                    delete assign[i].data[0].nodes[n].location;
                  }
                }
                // save the updated data
                assign[i].markModified('data'); //http://mongoosejs.com/docs/faq.html
                assign[i].save();
              }
            } catch (error) {
              console.log(error);
            }
        });
    return res.status(202).json({"message": "success"});
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

/* Delete the given assignment for the user with the given key */
exports.deleteAssignmentByKey = function (req, res) {
    var assignmentNumber;

    // ensure api keys match
    if(req.query.apikey != req.user.apikey) {
      return res.status(401).json({"error": "api key does not match"});
    }

    function isAssignmentNumber(n) {
        return n === +n && n === (n|0) && n >= 0;
    }

    // check validity of assignment number
    if(isAssignmentNumber(+req.params.assignmentNumber)) {
      assignmentNumber = req.params.assignmentNumber;
    } else {
      return res.status(400).json({"error": "assignment number is invalid"});
    }

    // delete all subassignments with the major assignment number for this user
    Assignment
        .find({
          "assignmentNumber": assignmentNumber,
          "email": req.user.email
        })
        .exec(function(err, assign) {
            if (err) return next(err);
            for (var i in assign) {
                assign[i].remove();
            }
            console.log("Deleted assignment: " + req.params.assignmentNumber, "for user", req.user.email);
        });
    res.status(200).json({"message": "Deleted assignment " + req.params.assignmentNumber + " for user " + req.user.email});
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
