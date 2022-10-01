const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-aggregate-paginate-v2');

const complimentaryService = new Schema({
    complimentaryServiceName: String,
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },

}, { timestamps: true, strict: false })

complimentaryService.plugin(mongoosePaginate);

module.exports = complimentaryService;
