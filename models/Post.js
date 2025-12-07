const mongoose = require("mongoose");
const postSchema = new mongoose.Schema({
    title: { type: String, required: true },
    body: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    tags: [String],
    published: { type: Boolean, default: true }
},
    { timestamps: true }
)

module.exports = mongoose.model(
    "post", postSchema
)