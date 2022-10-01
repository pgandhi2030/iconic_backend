const moment = require('moment')
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class PhotographerPayout {
    constructor(model) {
        this.Model = model;

    }
    async getAll() {
        return await this.Model.find({}).populate({
            path: 'createdBy',
            select: ['firstName', 'lastName']
        })
    }

    async createPhotographerPayout(request, response) {
        const data = request.body;
        let newService = data._id ? false : true
        // data._id = data._id ? data._id : mongoose.Types.ObjectId()
        data.createdBy = request.authData.userId;
        // console.log(data)
        const photographerPayout = await this.Model.findOneAndUpdate({ eventId: data.eventId, quotationId: data.quotationId }, { $set: data }, {
            upsert: true, new: true,
            setDefaultsOnInsert: true, runValidators: true
        }).then(result => {
            return response.status(200).send({ message: "Photographer Payout " + (newService ? "Added" : "Updated") + " Successfully." })
        }).catch(e => {
            return e
        });

    }

    async getPhotographerPayoutById(id) {
        return await this.Model.findById(id)
    }

    async deletePhotographerPayoutById(id) {
        return await this.Model.deleteMany({ _id: id })
    }

    async getPhotographerPayoutByEventIdAndQuotationId(eventId, quotationId) {
        return await this.Model.findOne({ eventId: eventId, quotationId: quotationId })
    }

    async getPhotographerPayoutByPhotographerId(photographerId) {
        return await this.Model.find({ "photographerPayoutData.photographerId": photographerId }).populate(["quotationId", 'quotationId.clientId'])
    }

    async addPhotographerWisePayout(data) {
        const payout = await this.Model.findOne({ eventId: data.eventId, quotationId: data.quotationId })
        const newPayoutData = []
        payout.photographerPayoutData.map(((photographer) => {

            if (mongoose.Types.ObjectId(photographer._id).equals(mongoose.Types.ObjectId(data._id))) {
                newPayoutData.push(data.photographerPayoutData)

            } else {
                newPayoutData.push(photographer)
            }
        }))
        const photographerPayout = await this.Model.findOneAndUpdate({ eventId: data.eventId, quotationId: data.quotationId }, { $set: { photographerPayoutData: newPayoutData } }, {
            upsert: true, new: true,
            setDefaultsOnInsert: true, runValidators: true
        }).then(result => {
            return "Photographer Payout Added Successfully."
        }).catch(e => {
            return e
        });
        return photographerPayout;

    }

}

module.exports = PhotographerPayout;
