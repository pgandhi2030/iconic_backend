const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-aggregate-paginate-v2');

const photographerPayout = new Schema({
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    photographerPayoutData: [{
        type: {
            type: String
        },
        photographerName: {
            type: String
        },
        photographerId: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        payment: {
            type: String
        },
        status: {
            type: String,
            default: "Pending"
        }
    }],
    eventId: {
        type: Schema.Types.ObjectId,
    },
    clientId: {
        type: Schema.Types.ObjectId,
        ref: "ClientData"
    },
    quotationId: {
        type: Schema.Types.ObjectId,
        ref: "Quotation"
    },

}, { timestamps: true, strict: false })

photographerPayout.plugin(mongoosePaginate);

module.exports = photographerPayout;
