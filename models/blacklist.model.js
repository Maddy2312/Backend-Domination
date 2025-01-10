const mongoose = require("mongoose");

const blacklistSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true
    }
}, {
    timestamps: true
});
blacklistSchema.index({ token: 1 }, { unique: true }); // Automatically remove documents after 1 hour

const Blacklist = mongoose.model('blacklist', blacklistSchema);

module.exports = Blacklist;
