const moment = require('moment')
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class ComplimentaryService {
    constructor(model) {
        this.Model = model;

    }
    async getAll() {
        return await this.Model.find({}).populate({
            path: 'createdBy',
            select: ['firstName', 'lastName']
        })
    }

    async createComplimentaryService(request, response) {
        const data = request.body;
        let newService = data._id ? false : true
        data._id = data._id ? data._id : mongoose.Types.ObjectId()
        data.createdBy = request.authData.userId;

        const complimentaryServiceDetails = await this.Model.findByIdAndUpdate(data._id, { $set: data }, {
            upsert: true, new: true,
            setDefaultsOnInsert: true, runValidators: true
        }).then(result => {
            return response.status(200).send({ message: "Complimentary Service " + (newService ? "Added" : "Updated") + " Successfully." })
        }).catch(e => {
            return e
        });

    }

    async getComplimentaryServiceById(id) {
        return await this.Model.findById(id)
    }

    async deleteComplimentaryServiceById(id) {
        return await this.Model.deleteMany({ _id: id })
    }

}

module.exports = ComplimentaryService;
