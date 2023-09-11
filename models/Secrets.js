const { model, default: mongoose } = require("mongoose");

const Schema = new mongoose.Schema({
    secret:String,
    author:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    username:String

})

module.exports = mongoose.model('secret',Schema);