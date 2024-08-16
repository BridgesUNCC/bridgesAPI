/**
 * This defines the SubmissionLog class
 *
 * This is essentially a restriction of an Assignment Object for logging purposes.
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


var SubmissionLog = new Schema ({

    //For tracking submissions and route creation
    username:           {type: String, default: ''},
    email:              {type: String, default: ''},
    assignmentNumber:   {type: String, default: ''},    //integer portion
    subAssignment:      {type: String, default: ''},    //fractional portion
    assignmentID:       {type: Number, default: ''},   // integer representation of an assignment

    //Assignment Attributes
    title:              {type: String, default: ''},
    dateCreated:        {type: Date, default: Date.now},

    //what assignment type is this
    assignment_type:    {type: String, default:'nodelink'},
});

mongoose.model('SubmissionLog', SubmissionLog);
