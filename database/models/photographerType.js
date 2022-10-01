const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-aggregate-paginate-v2');

const photographerType = new Schema({
    photographerTypeName: String,
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },

}, { timestamps: true, strict: false })

photographerType.plugin(mongoosePaginate);

module.exports = photographerType;
