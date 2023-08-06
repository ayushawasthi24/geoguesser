const mongoose = require('mongoose');
require('mongoose-double')(mongoose);
var SchemaTypes = mongoose.Schema.Types;
const imageSchema = mongoose.Schema({
    _id: {
        type: Number,
        required: true,
        unique: true,
    },
    path:{
        type: String,
        required: true,
    },
    lat:{
        type: SchemaTypes.Double,
        required: true,
        default: 0,
    },
    long: {
        type: SchemaTypes.Double,
        required: true,
        default:0,
    },
    name : {
        type: String,
        required: true,
    }
});

const Image = mongoose.model("Image", imageSchema);
module.exports = Image;