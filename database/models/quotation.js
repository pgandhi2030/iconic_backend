const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-aggregate-paginate-v2');

const quotation = new Schema({
    title: String,
    clientId: {
        type: Schema.Types.ObjectId,
        ref: "ClientData"
    },
    quotationNumber: String,
    eventDetails: [{
        eventDateTime: Date,
        eventPlace: String,
        eventDescription: String,
        isPhotographersAssigned: { type: Boolean, default: false },
        photographerTypes: [{
            photographerType: String,
            requiredPhotographers: String,
            photographers: [{
                type: Schema.Types.ObjectId,
                ref: "User"
            },]
        }],
        isPageBreak: { type: Boolean, default: false },
        isNewPage: { type: Boolean, default: false },
        coordinateWith: String,
        rawData: String,
        rawDataStatus: { type: String, default: "Pending Approval" },
        payoutData: Object,//for initialization only
    }],
    services: [{
        serviceName: {
            type: Schema.Types.ObjectId,
            ref: "Service"
        },
        deliveryTime: String
    }],
    complimentaryService: [String],
    eventManagedBy: String,
    finalAmount: String,
    discount: String,
    paymentPlan: [{
        phaseName: String,
        amount: String,
    }],
    status: {
        type: String,
        default: "Send For Approval"
    },
    description: String,
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
}, { timestamps: true, strict: false })

quotation.plugin(mongoosePaginate);

module.exports = quotation;
