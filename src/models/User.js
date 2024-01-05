const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    identifier: {
        type: String,
        required: true,
        unique: true,
    },
    username: {
        type: String,
        required: true,
    },
    displayName: {
        type: String,
    },
    avatar: {
        type: String,
    },
    points: {
        type: Number,
        default: 0,
        min: 0,
    },
    total_points: {
        type: Number,
        default: 0,
        min: 0,
    },
    role: {
        type: String,
        default: "user",
    },

    accessToken: {
        type: String,
    },
    refreshToken: {
        type: String,
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("User", schema);
