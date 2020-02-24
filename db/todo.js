var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({

    name:{
        type: String,
        required: true,
        minlength: 1,
        trim: true
    },
    status: {
        type: String,
        required: true,
        enum: ["new", "done", "delete"]
    },
    userId:{
        type: Schema.Types.ObjectId,
        ref :'User',
      },
},
    {
        timestamps: true
    });

var Todo = mongoose.model('Todo', schema);
module.exports = Todo;
