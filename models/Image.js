const mongoose = require('mongoose');

const imageSchema = mongoose.Schema({
    url: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    xcoordinate: {
        type: Number,
        required: true,
    },
    ycoordinate: {
        type: Number,
        required: true,
    },
    name : {
        type: String,
        required: true,
    }
});

const Image = mongoose.model("Image", imageSchema);
module.exports = Image;