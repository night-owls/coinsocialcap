const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const util = require('util');


// User Schema
const UserSchema = mongoose.Schema({
  first_name: {
    type: String,
    required: true
  },
  last_name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String
  },
  verified: {
    type: Boolean,
    default: false
  },
  birthday: {
    type: Date,
    required: true
  },
  correct_score: {
    type: Number,
    default: 0,
    min: 0
  },
  uncorrect_score: {
    type: Number,
    default: 0,
    min: 0
  },
  followers: {
    type: [String]
  },
  following: {
    type: [String]
  },
  email_activation_key: {
    type: String
  },
  forgot_password_token: {
    type: String
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  },
  deleted_at: {
    type: Date
  }
});

const User = module.exports = mongoose.model('User', UserSchema);

module.exports.getUserById = function(id, callback) {
  User.findById(id, callback);
}

module.exports.getUserByEmail = function(email, callback) {
  const query = {
    email: email
  }
  User.findOne(query, callback);
}

module.exports.listUsers = function(filter, callback) {
  let limit = 25
  if (filter.limit)
    limit = filter.limit;

  query = {
    deleted_at: null
  }

  if (filter.first_name)
    query["first_name"] = {
      "$regex": util.format(".*%s.*", filter.first_name)
    };

  if (filter.last_name)
    query["last_name"] = {
      "$regex": util.format(".*%s.*", filter.last_name)
    };

  if (filter.email)
    query["email"] = {
      "$regex": util.format(".*%s.*", filter.email)
    };

  if (filter.start_birthday_at || filter.end_birthday_at) {
    birthday_query = {}
    if (filter.start_birthday_at)
      birthday_query["$gt"] = filter.start_birthday_at;
    if (filter.end_birthday_at)
      birthday_query["$lt"] = filter.end_birthday_at;
    query["birthday"] = birthday_query;
  }

  if (filter.start_correct_score_at || filter.end_correct_score_at) {
    correct_score_query = {}
    if (filter.start_correct_score_at)
      correct_score_query["$gt"] = filter.start_correct_score_at;
    if (filter.end_correct_score_at)
      correct_score_query["$lt"] = filter.end_correct_score_at;
    query["correct_score"] = correct_score_query;
  }

  if (filter.start_uncorrect_score_at || filter.end_uncorrect_score_at) {
    uncorrect_score_query = {}
    if (filter.start_uncorrect_score_at)
      uncorrect_score_query["$gt"] = filter.start_uncorrect_score_at;
    if (filter.end_uncorrect_score_at)
      uncorrect_score_query["$lt"] = filter.end_uncorrect_score_at;
    query["uncorrect_score"] = uncorrect_score_query;
  }

  if (filter.friends) {
    query["friends"] = {
      "$in": filter.friends
    };
  }

  if (filter.start_created_at || filter.end_created_at) {
    created_at_query = {}
    if (filter.start_created_at)
      created_at_query["$gt"] = filter.start_created_at;
    if (filter.end_created_at)
      created_at_query["$lt"] = filter.end_created_at;
    query["created_at"] = created_at_query;
  }

  if (filter.start_updated_at || filter.end_updated_at) {
    updated_at_query = {}
    if (filter.start_updated_at)
      updated_at_query["$gt"] = filter.start_updated_at;
    if (filter.end_updated_at)
      updated_at_query["$lt"] = filter.end_updated_at;
    query["updated_at"] = updated_at_query;
  }

  User.find(query, callback).limit(limit);
}

// Update User
module.exports.updateUser = function(id, updateUser, callback) {
  User.findById(id, function(err, user) {
    if (err) return handleError(err);
    updateUser.updated_at = new Date();
    user.set(updateUser);
    user.save(callback);
  });
}

// Increment Score
module.exports.incrementScore = function(id, type, callback) {
  if (type == "correct_score")
    return User.findOneAndUpdate({
      _id: id
    }, {
      $inc: {
        'correct_score': 1
      }
    }).exec();
  else if (type == "uncorrect_score")
    return User.findOneAndUpdate({
      _id: id
    }, {
      $inc: {
        'uncorrect_score': 1
      }
    }).exec();
}

// Change User
module.exports.changePassword = function(user, password, callback) {
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, (err, hash) => {
      if (err)
        throw err;
      user.password = hash;
      user.forgot_password_token = "";
      user.save(callback);
    });
  })
}

// Create User
module.exports.createUser = function(newUser, callback) {
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(newUser.password, salt, (err, hash) => {
      if (err)
        throw err;
      newUser.password = hash;
      newUser.email_activation_key = crypto.randomBytes(20).toString('hex');
      newUser.save(callback);
    });
  })
}

module.exports.comparePassword = function(password, hash, callback) {
  bcrypt.compare(password, hash, (err, isMatch) => {
    if (err)
      throw err;

    callback(null, isMatch);
  })
}
