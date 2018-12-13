/**
 * This defines the Assignments class
 *   Assignments are uniquely identified by a user's credentials (username, email) and
 *   an assignmentID (assignment and subassignment numbers)
 *
 *   Assignments (including subassignments) can have titles and descriptions added.
 *
 *   The type of visualization associated with the assignment is the specified vistype, and
 *     the assignment_type is the more specific type of assignment (i.e. BinarySearchTree
 *     assignments use the tree vistype)
 */

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;


var Assignment = new Schema ({

    //For tracking submissions and route creation
    username:           {type: String, default: ''},
    email:              {type: String, default: ''},
    assignmentNumber:   {type: String, default: ''},    //integer portion
    subAssignment:      {type: String, default: ''},    //fractional portion
    assignmentID:       {type: Number, default: ''},   // integer representation of an assignment

    //Assignment Attributes
    title:              {type: String, default: ''},
    description:        {type: String, default: ''},
    dateCreated:        {type: Date, default: Date.now},
    //public or private
    shared:             {type: Boolean, default: 'true'},
    //which visualization code does this use
    vistype:            {type: String, default:'nodelink'},
    //what assignment type is this
    assignment_type:    {type: String, default:'nodelink'},
    //visualize as slide or stack of assignments
    default_display:    {type: String, default:'slide'},

    //Assignment data (nodes, links, attributes)
    data: [Schema.Types.Mixed]
});

mongoose.model('Assignment', Assignment);
