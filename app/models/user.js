 // Module dependencies.

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    crypto = require('crypto'),
    authTypes = ['twitter'];

// User Schema
var UserSchema = new Schema({
    email: { type: String, default: '', validate:{
      validator: async function(value){
        const user = await this.constructor.findOne({email: value});
        return !user;
      },
      message: props => `Email ${props.value} is already in use!`
    }},
    username: { type: String, default: '', validate:{
      validator: async function(value){
        const user = await this.constructor.findOne({username: value});
        return !user;
      },
      message: props => `Username ${props.value} is already in use!`
    }},
    provider: { type: String, default: '' },
    hashed_password: { type: String, default: '' },
    salt: { type: String, default: '' },
    apikey: {type: String, default: ''},
    password_reset: {
      reset_token: {type: String},
      reset_timeout: {type: Date}
    },
    institution_name: {type: String, default: ''},
    course_name: {type: String, default: ''},
    admin: {type: Boolean, default: false}
});

// Virtuals
UserSchema
    .virtual('password')
    .set(function(password) {
        this._password = password;
        this.salt = this.makeSalt();
        this.hashed_password = this.encryptPassword(password);
    })
    .get(function() { return this._password; });

// Validations
var validatePresenceOf = function (value) {
    return value && value.length;
};

var validatePasswordLength = function (password) {
    return password.length > 5;
};

/*
Validation code to check if the email field for the signup form is 
populated and not empty. If validation fails, it sends a message that it cannot be blank. 
*/
UserSchema.path('email').validate(function (email) {
    // if authenticating by an oauth strategies, don't validate
    if (authTypes.indexOf(this.provider) !== -1) return true;
    return email.length;
}, 'Email cannot be blank');

/*
Validation code to check if the institution_name field for the signup form is 
populated and not empty. If validation fails, it sends a message that it cannot be blank. 
*/
UserSchema.path('institution_name').validate(function (institution_name) {
    console.log("coco");
    // if authenticating by an oauth strategies, don't validate
    if (authTypes.indexOf(this.provider) !== -1) return true;
    return institution_name.length;
}, 'Institution cannot be blank');



/*
Validation code to check if the email submitted from the signup page
is not a duplicate. It queries the database for a document that matches the email from the 
form. If there is a response document it returns a rejected promise, else it resolves as true.
This function must be async so we can get the response back from the database query.
*/
// UserSchema.path('email').validate({
//   isAsync: true,
//   validator: function (email, fn) {
//     var User = mongoose.model('User');

//     // if authenticating by an oauth strategies, don't validate
//     if (authTypes.indexOf(this.provider) !== -1) fn(true);

//     console.log(this.isNew)
//     // Check only when it is a new user or when email field is modified
//     if (this.isNew || this.isModified('email')) {
//         User.find({ email: email }).exec(function (err, users) {
//           fn(!err && users.length === 0);
//       });
//     } else fn(true);
//   },
//   message: 'Email already exists'
// });

/*
Validation code to check if the username field for the signup form is 
populated and not empty. If validation fails, it sends a message that it cannot be blank. 
*/
UserSchema.path('username').validate(function (username) {
    // if authenticating by an oauth strategies, don't validate
    if (authTypes.indexOf(this.provider) !== -1) return true;
    return username.length;
}, 'Username cannot be blank');

/*
Validation code to check if the username submitted from the signup page
is not a duplicate. It queries the database for a document that matches the username from the 
form. If there is a response document it returns a rejected promise, else it resolves as true.
This function must be async so we can get the response back from the database query.
*/
UserSchema.path('username').validate(function (username) {
  return /^[a-zA-Z0-9\-_]{3,40}$/.test(username);
}, 'Usernames must contain alphanumeric characters a-z, A-Z, 0-9, underscores, and hyphens, and must be between 3 and 40 characters long.');

// UserSchema.path('username').validate({
//   isAsync: true,
//   validator: function (username, fn) {
//     var User = mongoose.model('User');

//     // if authenticating by an oauth strategies, don't validate
//     if (authTypes.indexOf(this.provider) !== -1) fn(true);

//     // Check only when it is a new user or when email field is modified
//     if (this.isNew || this.isModified('username')) {
//         User.find({ username: username }).exec(function (err, users) {
//             fn(!err && users.length === 0);
//         });
//     } else fn(true);
//   },
//   message: 'Username already exists'
// });


UserSchema.path('hashed_password').validate(function (hashed_password) {
    // if authenticating by an oauth strategies, don't validate
    if (authTypes.indexOf(this.provider) !== -1) return true;
    return hashed_password.length;
}, 'Password cannot be blank');

//Pre-save hook
UserSchema.pre('save', function(next) {
    if (!this.isNew) return next();
    if ((!validatePresenceOf(this.password) || !validatePasswordLength(this.password)) && authTypes.indexOf(this.provider) === -1)
        next(new Error('Invalid password (must be at least 5 characters)'));
    else
        next();
});

/**
 * Methods
 */

UserSchema.methods = {

  /**
   * Authenticate - check if the passwords are the same
   *
   * @param {String} plainText
   * @return {Boolean}
   * @api public
   */

  authenticate: function (plainText) {
    return this.encryptPassword(plainText) === this.hashed_password;
  },

  generateKey: function () {
    this.apikey = Math.round(new Date().valueOf() * Math.random());
  },

  /**
   * Make salt
   *
   * @return {String}
   * @api public
   */

  makeSalt: function () {
    return Math.round((new Date().valueOf() * Math.random())) + '';
  },

  /**
   * Encrypt password
   *
   * @param {String} password
   * @return {String}
   * @api public
   */

  encryptPassword: function (password) {
    if (!password) return '';
    var encrypred;
    try {
      encrypred = crypto.createHmac('sha1', this.salt).update(password).digest('hex');
      return encrypred;
    } catch (err) {
      return '';
    }
  },
    
  /**
   * Add password reset token and expiry date
   *
   * @param {String} token
   * @api public
   */
   setToken: function(token, cb) {
     if(!token) return false;
     this.password_reset.reset_token = crypto.createHash('sha512').update(token).digest('hex');
     this.password_reset.reset_timeout = new Date(Date.now() + (2*1000*60*60));
     this.save(function(err, usr) {
       if(err) cb(err);
       cb(null);
     });
   },

    hasAdminRights: function() {
	return this.admin == true;
    }
};

mongoose.model('User', UserSchema);
