const moment = require('moment')
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const transporter = require('../config/sendMail');

class ClientDetails {
    constructor(model) {
        this.Model = model;

    }
    async getAll() {
        return await this.Model.find({})
    }

    async createClientEnquiry(request, response) {
        const data = request.body;
        if (!data._id) {
            const html = `<table class="body-wrap" style="margin-top:0;margin-bottom:0;margin-right:0;margin-left:0;padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;font-family:'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif;box-sizing:border-box;font-size:14px;background-color:#f6f6f6;width:100% !important;" >
                <tr style="margin-top:0;margin-bottom:0;margin-right:0;margin-left:0;padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;font-family:'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif;box-sizing:border-box;font-size:14px;" >
                    <td style="margin-top:0;margin-bottom:0;margin-right:0;margin-left:0;padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;font-family:'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif;box-sizing:border-box;font-size:14px;vertical-align:top;" ></td>
                    <td class="container" width="600" style="padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;font-family:'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif;box-sizing:border-box;font-size:14px;vertical-align:top;display:block !important;max-width:600px !important;margin-top:0 !important;margin-bottom:0 !important;margin-right:auto !important;margin-left:auto !important;clear:both !important;" >
                        <div class="content" style="font-family:'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif;box-sizing:border-box;font-size:14px;max-width:600px;margin-top:0;margin-bottom:0;margin-right:auto;margin-left:auto;display:block;padding-top:20px;padding-bottom:20px;padding-right:20px;padding-left:20px;" >
                            <table class="main" width="100%" cellpadding="0" cellspacing="0" style="margin-top:0;margin-bottom:0;margin-right:0;margin-left:0;padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;font-family:'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif;box-sizing:border-box;font-size:14px;width:100% !important;background-color:#fff;background-image:none;background-repeat:repeat;background-position:top left;background-attachment:scroll;border-width:1px;border-style:solid;border-color:#e9e9e9;border-radius:3px;" >
                                <tr style="margin-top:0;margin-bottom:0;margin-right:0;margin-left:0;padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;font-family:'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif;box-sizing:border-box;font-size:14px;" >
                                    <td class="content-wrap" style="margin-top:0;margin-bottom:0;margin-right:0;margin-left:0;font-family:'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif;box-sizing:border-box;font-size:14px;vertical-align:top;padding-top:20px;padding-bottom:20px;padding-right:20px;padding-left:20px;" >
                                        <table cellpadding="0" cellspacing="0" style="margin-top:0;margin-bottom:0;margin-right:0;margin-left:0;padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;font-family:'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif;box-sizing:border-box;font-size:14px;width:100% !important;" >
                                            <tr style="margin-top:0;margin-bottom:0;margin-right:0;margin-left:0;padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;font-family:'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif;box-sizing:border-box;font-size:14px;" >
                                                <td style="margin-top:0;margin-bottom:0;margin-right:0;margin-left:0;padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;font-family:'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif;box-sizing:border-box;font-size:14px;vertical-align:top;" >
                                                    <a target="_blank" href="https://www.iconicfilms.in/" style="margin-top:0;margin-bottom:0;margin-right:0;margin-left:0;padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;font-family:'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif;box-sizing:border-box;font-size:14px;text-decoration:underline;" >
                                                        <img class="img-fluid" src="http://139.59.73.85/images/iconic%20logo-title.png" style="width:120px;height: 140px" /></a>
                                                </td>
                                            </tr>
                                        </table>
                                        <table style="margin-top:0;margin-bottom:0;margin-right:0;margin-left:0;padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;font-family:'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif;box-sizing:border-box;font-size:14px;width:100% !important;" >
                                            <tr style="margin-top:0;margin-bottom:0;margin-right:0;margin-left:0;padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;font-family:'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif;box-sizing:border-box;font-size:14px;" >
                                                <td class="content-block" style="margin-top:0;margin-bottom:0;margin-right:0;margin-left:0;font-family:'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif;box-sizing:border-box;font-size:14px;padding-top:15px;vertical-align:top;padding-bottom:20px;padding-right:0;padding-left:0;" >
                                                    <p style="margin-top:0;margin-right:0;margin-left:0;padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;font-family:'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif;box-sizing:border-box;font-size:14px;margin-bottom:10px;font-weight:normal;" >
                                                        <h1>Welcome, `+ data.groomName + ` and ` + data.brideName + `</h1>
                                                        <p><b>Thank You for contacting the Iconic Films and Photography</b></p><br>
                                                    </p>
                                                </td>
                                            </tr>
                                        </table>
                                        <table style="margin-top:0;margin-bottom:0;margin-right:0;margin-left:0;padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;font-family:'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif;box-sizing:border-box;font-size:14px;width:100% !important;" >
                                            <tr style="margin-top:0;margin-bottom:0;margin-right:0;margin-left:0;padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;font-family:'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif;box-sizing:border-box;font-size:14px;" >
                                                <td class="aligncenter content-block" style="margin-top:0;margin-bottom:0;margin-right:0;margin-left:0;font-family:'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif;box-sizing:border-box;vertical-align:top;padding-top:0;padding-bottom:5px;padding-right:0;padding-left:0;text-align:center;font-size:12px;" >
                                                    <p style="margin-top:0;margin-right:0;margin-left:0;padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;font-family:'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif;box-sizing:border-box;font-size:14px;margin-bottom:5px;font-weight:normal;" >
                                                        @<a
                                                            href="https://www.iconicfilms.in/" target="_blank" style="margin-top:0;margin-bottom:0;margin-right:0;margin-left:0;padding-top:0;padding-bottom:0;padding-right:0;padding-left:0;font-family:'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif;box-sizing:border-box;font-size:14px;" >Iconic Films and photography</a>
                                                    </p>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td class="aligncenter content-block" style="margin-top:0;margin-bottom:0;margin-right:0;margin-left:0;font-family:'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif;box-sizing:border-box;vertical-align:top;padding-top:0;padding-bottom:20px;padding-right:0;padding-left:0;text-align:center;font-size:12px;" >Please do not reply to this mail. This is an auto generated mail.</td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </div>
                    </td>
                </tr>
            </table>`
            const message = {
                from: "ICONIC FILMS AND PHOTOGRAPHY <pgandhi2512@zohomail.in>",
                to: data.email,
                subject: "Welcome To Iconic Films & Photography",
                html: html,

            };
            let info = transporter.sendMail(message, function (err, info) {

                if (err) {
                    console.log("Message error: %s", err);
                }
                console.log("Mail sent to email id.")
            });
        }
        data._id = data._id ? data._id : mongoose.Types.ObjectId()
        data.createdBy = request.authData.userId;
        const clientDetails = await this.Model.findByIdAndUpdate(data._id, { $set: data }, {
            upsert: true, new: true,
            setDefaultsOnInsert: true, runValidators: true
        }).then(result => {
            return response.status(200).send({ message: "Client Registration Successful." })
        }).catch(e => {
            return e
        });

    }

    async getClientDetailsById(id) {
        return await this.Model.findById(id)
    }

    

    async convertClientToProject(clientId) {

       
        const client = await this.Model.findByIdAndUpdate(clientId, { $set: { status: "Project" } }, {
            upsert: true, new: true,
            setDefaultsOnInsert: true, runValidators: true
        }).then(result => {
            return result
        }).catch(e => {
            return e
        });

        return client
    }

    async getAllByStatus(status) {
        return await this.Model.find({ status: status })
    }

}

module.exports = ClientDetails;
