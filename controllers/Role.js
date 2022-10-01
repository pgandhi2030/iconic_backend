
const mongoose = require('mongoose');

class Role {
    constructor(model) {
        this.Model = model;

    }
    async getAll() {
        const roles = await this.Model.find({});
        return roles;
    }


    async createOrUpdateRoles(request, response) {
        await Promise.all(request.body.map(async (data) => {
            data._id = data._id == null ? mongoose.Types.ObjectId() : data._id;
            const role = await this.Model.findOneAndUpdate({ _id: data._id }, { $set: data },
                { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true }
            ).then(result => {
                return result
            }).catch(e => { return e });
        }));
        return response.status(200).send({ message: "Roles Added Successfully." })
    }
}

module.exports = Role;
