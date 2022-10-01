const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-aggregate-paginate-v2');

const service = new Schema({
    serviceName: String,
    estimatedTime: String,
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    isDelete: Boolean
}, { timestamps: true, strict: false })

service.plugin(mongoosePaginate);

module.exports = service;
