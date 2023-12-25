const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    winner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    active: {
        type: Boolean,
        default: true,
    },
    deadline: {
        type: Date,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
});

module.exports = mongoose.model("Giveaway", schema);
