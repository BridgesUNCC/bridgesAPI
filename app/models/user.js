 // Module dependencies.

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    crypto = require('crypto'),
    _ = require('underscore'),
    authTypes = ['twitter'];

// User Schema
var UserSchema = new Schema({
    email: { type: String, default: '' },
    username: { type: String, default: '' },
    provider: { type: String, default: '' },
    hashed_password: { type: String, default: '' },
    salt: { type: String, default: '' },
    apikey: {type: String, default: ''},
    password_reset: {
      reset_token: {type: String},
      reset_timeout: {type: Date}
    },
    institution_name: {type: String, default: ''},
    course_name: {type: String, default: ''}
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

// Validate Email
UserSchema.path('email').validate(function (email) {
    // if authenticating by an oauth strategies, don't validate
    if (authTypes.indexOf(this.provider) !== -1) return true;
    return email.length;
}, 'Email cannot be blank');

UserSchema.path('email').validate({
  isAsync: true,
  validator: function (email, fn) {
    var User = mongoose.model('User');

    // if authenticating by an oauth strategies, don't validate
    if (authTypes.indexOf(this.provider) !== -1) fn(true);

    // Check only when it is a new user or when email field is modified
    if (this.isNew || this.isModified('email')) {
        User.find({ email: email }).exec(function (err, users) {
          fn(!err && users.length === 0);
      });
    } else fn(true);
  },
  message: 'Email already exists'
});

//Validate Username
UserSchema.path('username').validate(function (username) {
    // if authenticating by an oauth strategies, don't validate
    if (authTypes.indexOf(this.provider) !== -1) return true;
    return username.length;
}, 'Username cannot be blank');

UserSchema.path('username').validate(function (username) {
  return /^[a-zA-Z0-9\-_]{3,40}$/.test(username);
}, 'Usernames must contain alphanumeric characters a-z, A-Z, 0-9, underscores, and hyphens, and must be between 3 and 40 characters long.');

UserSchema.path('username').validate({
  isAsync: true,
  validator: function (username, fn) {
    var User = mongoose.model('User');

    // if authenticating by an oauth strategies, don't validate
    if (authTypes.indexOf(this.provider) !== -1) fn(true);

    // Check only when it is a new user or when email field is modified
    if (this.isNew || this.isModified('username')) {
        User.find({ username: username }).exec(function (err, users) {
            fn(!err && users.length === 0);
        });
    } else fn(true);
  },
  message: 'Username already exists'
});

UserSchema.path('hashed_password').validate(function (hashed_password) {
    // if authenticating by an oauth strategies, don't validate
    if (authTypes.indexOf(this.provider) !== -1) return true;
    return hashed_password.length;
}, 'Password cannot be blank');

//Pre-save hook
UserSchema.pre('save', function(next) {
    if (!this.isNew) return next();
    if ((!validatePresenceOf(this.password) || !validatePasswordLength(this.password)) && authTypes.indexOf(this.provider) === -1)
        next(new Error('Invalid password'));
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
   }

};

mongoose.model('User', UserSchema);
