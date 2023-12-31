const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    text: {
        type: String,
        required: true,
    },
    images: [{ type: String }], //urls
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

module.exports = mongoose.model("Evidence", schema);
