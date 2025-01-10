const mongoose = require("mongoose");

const connectDB = ()=>{
    try {
        mongoose.connect(process.env.MONGO_URI).then(()=>{
            console.log("MongoDB successful");
        }).catch((err)=>{
            console.log(err);
        })
    } catch (error) {
        console.log(error);
    }
}

module.exports = connectDB;