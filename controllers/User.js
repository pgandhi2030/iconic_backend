const moment = require('moment')
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class User {
    constructor(model) {
        this.Model = model;

    }

    async signIn(request, response) {
        let user = await this.Model.findOne({ $or: [{ 'emailId': request.body.username }, { mobileNumber: request.body.username }] }).lean();
        // if (!user.email_verified_at) throw new Error('Your Email / Mobile number is not verified');
        if (!user) return response.status(400).send({ error: "User Not Found" });
        if (!user.isActive) return response.status(400).send({ error: "You Don't have permission to access the system as you are marked as inactive user" });
        const flag = await bcrypt.compare(request.body.password, user.password);
        if (flag) {
            return user
        } else {
            return response.status(400).send({ error: 'Username or password not match!' });
        }

    }


    async signUp(request, response) {
        const data = request.body;
        if (data.password) {
            data.password = bcrypt.hashSync(data.password, bcrypt.genSaltSync(10), null);
        }
        data._id = data._id ? data._id : mongoose.Types.ObjectId()
        delete data.confirmPassword
        const user = await this.Model.findByIdAndUpdate(data._id, { $set: data }, {
            upsert: true, new: true,
            setDefaultsOnInsert: true, runValidators: true
        }).then(result => {
            return response.status(200).send({ message: "User Registration successfully done." })
        }).catch(e => {
            console.log(e);
            return e
        });

    }

    async userKyc(request, response) {
        const data = request.body;
        data._id = data._id ? data._id : mongoose.Types.ObjectId()
        data['kycDone'] = true
        const user = await this.Model.findByIdAndUpdate(data._id, { $set: data }, {
            upsert: false, new: true,
            setDefaultsOnInsert: true, runValidators: true
        }).then(result => {
            console.log(result)
            return response.status(200).send({ message: "User KYC successfully done." })
        }).catch(e => {
            console.log(e)

            return e
        });
        return true
    }

    async createUser(request, response) {
        const data = request.body;
        data._id = data._id ? data._id : mongoose.Types.ObjectId()
        if (data.password) {
            data.password = bcrypt.hashSync(data.password, bcrypt.genSaltSync(10), null);
        }
        const user = await this.Model.findByIdAndUpdate(data._id, { $set: data }, {
            upsert: true, new: true,
            setDefaultsOnInsert: true, runValidators: true
        }).then(result => {
            console.log(result)
            return response.status(200).send({ message: "User Created successfully." })
        }).catch(e => {
            console.log(e)
            return e
        });
        return true
    }

    async getUserById(id) {
        return await this.Model.findById(id).lean()
    }

    async photographerApproval(request, response) {
        const data = request.body;
        data._id = data._id ? data._id : mongoose.Types.ObjectId()
        const user = await this.Model.findByIdAndUpdate(data._id, { $set: { approved: data.approved, approvedAt: new Date() } }, {
            upsert: false, new: true,
            setDefaultsOnInsert: true, runValidators: true
        }).then(result => {
            return response.status(200).send({ message: "Photographer Approved successfully" })
        }).catch(e => {
            return e
        });
    }


    async logOut(request, response) {
        try {

            const domain = ".localhost";

            // const options = {
            //     httpOnly: false, // cookie is only accessible by the server
            //     maxAge: 5000, // ex. days * hours * minutes * seconds * miliseconds
            //     secure: true,
            //     sameSite: 'none', // only sent for requests to the same FQDN as the domain in the cookie.
            //     domain: domain
            // }
            // response.cookie('token', "", options);
            return response.status(200).send({ message: "Logout successfully done." })

        } catch (e) {
            return false;
        }
    }

    async getAllEmployees() {
        return await this.Model.find({ role: "employee" }).lean()
    }

    async getAll() {
        return await this.Model.find({}).lean()
    }


}

module.exports = User;
