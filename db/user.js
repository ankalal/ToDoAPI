var mongoose = require('mongoose');
var Schema = mongoose.Schema;
bcrypt = require('bcrypt'),
SALT_WORK_FACTOR = 10;

var schema = new Schema(
    {
        userName: {
            type: String,
            required: true,
            minlength: 1,
            trim: true,
            unique: true 
        },
        password: {
            type: String,
            required: true,
            minlength: 1,
            trim: true
        },
    },
    {
        timestamps: true
    }
    );

schema.pre('save', function (next) {
    var user = this;
    if (!user.isModified('password')) return next();
    bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
        if (err) return next(err);
        bcrypt.hash(user.password, salt, function (err, hash) {
            if (err) return next(err);
            user.password = hash;
            next();
        });
    });
});
schema.methods.comparePassword = function (candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};

var User = mongoose.model('User', schema);
module.exports = User;


