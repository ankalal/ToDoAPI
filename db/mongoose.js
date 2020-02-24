var mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.set('useCreateIndex', true)
mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true,useUnifiedTopology: true  });
module.exports = mongoose;
