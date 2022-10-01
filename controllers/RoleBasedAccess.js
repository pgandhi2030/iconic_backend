
const mongoose = require('mongoose');

class RoleBasedAccess {
    constructor(model) {
        this.Model = model;

    }
    async getAll() {
        const roleBasedAccess = await this.Model.find({});
        return roleBasedAccess;
    }


    async createOrUpdateRoleBasedAccess(request, response) {
        const data = request.body
        // data._id = data._id == null ? mongoose.Types.ObjectId() : data._id;
        const roleBasedAccess = await this.Model.findOneAndUpdate({ resource: data.resource, role: data.role }, { $set: data },
            { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true }
        ).then(result => {
            return result
        }).catch(e => { return e });
        return response.status(200).send({ message: "Permission " + (data.hasAccess ? "given" : "revoked") + " Successfully." })
    }

    async getAllByRole(role) {
        return await this.Model.find({ role: role }).lean()
    }

}

module.exports = RoleBasedAccess;
