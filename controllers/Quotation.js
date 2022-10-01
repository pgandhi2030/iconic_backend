const moment = require('moment')
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pdf = require("pdf-creator-node");
const fs = require('fs');
const transporter = require('../config/sendMail');


class Quotation {
    constructor(model) {
        this.Model = model;

    }
    async getAll() {
        return await this.Model.find({})
    }

    async createQuotation(request, response) {
        const data = request.body;
        const existingQuotations = await this.getAll();
        let quotationNumber = "Iconic" + (existingQuotations ? existingQuotations.length + 1 : 1)

        const existingClientQuotation = await this.getQuotationById(data.quotationId)
        if (data.type == "Edit") {
            const quotations = await this.Model.find({ quotationNumber: { $regex: ".*" + existingClientQuotation.quotationNumber.split("/R")[0] + ".*" } })
            quotationNumber = existingClientQuotation.quotationNumber.split("/R")[0] + "/R" + (quotations.length)
        }

        data._id = mongoose.Types.ObjectId()
        // data.eventDetails.map((event) => {
        //     return event.photographerTypes = event.photographerTypes.join(", ")
        // })
        data.quotationNumber = quotationNumber;
        data.createdBy = request.authData.userId;
        const quotation = await this.Model.findByIdAndUpdate(data._id, { $set: data }, {
            upsert: true, new: true,
            setDefaultsOnInsert: true, runValidators: true
        }).then(result => {
            return response.status(200).send({ message: "Quotation Created Successful." })
        }).catch(e => {
            return e
        });


    }

    async getQuotationById(id) {
        const quotation = await this.Model.findById(id).populate("services.serviceName").lean()

        return quotation
    }

    async getQuotationByIdWithClient(id) {
        const quotation = await this.Model.findById(id).populate("clientId").lean()

        return quotation
    }

    async getQuotationsByClientId(clientId) {
        return await this.Model.find({ clientId: clientId }).populate("services.serviceName")
    }

    async approvedQuotationsByClientId(clientId) {
        return await this.Model.find({ clientId: clientId, status: "Approved" }).populate("eventDetails.photographerTypes.photographers")
    }

    async changeQuotationStatus(req, res) {
        const quotation = await this.Model.findByIdAndUpdate(req.body.quotationId, { $set: { status: req.body.status } }, {
            upsert: true, new: true,
            setDefaultsOnInsert: true, runValidators: true
        }).then(result => {
            return res.status(200).send({ message: "Quotation " + req.body.status + " Successful." })
        }).catch(e => {
            return e
        });
    }

    async getQuotationPDF(quotationId) {
        const quotationData = await this.Model.findById(quotationId).populate(['clientId', "services.serviceName"]).lean()
        quotationData['createdAt'] = moment(quotationData['createdAt']).format("DD-MM-YYYY")
        quotationData['eventDetails'] = await quotationData['eventDetails'].map((event, index) => {
            if (index > 0 && (index + 1) % 2 == 0) {
                event.isPageBreak = true
            }
            if (index > 0 && (index) % 2 == 0) {
                event.isNewPage = true
            }
            event.eventDateTime = moment(event.eventDateTime).format("DD-MM-YYYY");
            return event
        })
        quotationData['complimentaryService'] = quotationData['complimentaryService'].join(", ")

        let html = fs.readFileSync('pdfTemplates/quotation.html', 'utf8');
        let bitmap = fs.readFileSync('pdfTemplates/background.png');
        const background = bitmap.toString('base64');

        let logoBitmap = fs.readFileSync('pdfTemplates/logoWithRing.png');
        const logoWithRing = logoBitmap.toString('base64');

        let imgIntroBitmap = fs.readFileSync('pdfTemplates/iconic.png');
        const imgIntro = imgIntroBitmap.toString('base64');

        let options = {
            format: "A4",
            orientation: "portrait",
            // margin: "10mm",
        };
        let fileName = quotationData.clientId.groomName
        if (quotationData.photographyType == "Bride Side") {
            fileName = quotationData.clientId.brideName
        } else if (quotationData.photographyType == "Both") {
            fileName = quotationData.clientId.groomName + "_" + quotationData.clientId.brideName
        }
        fileName += "_" + (quotationData.quotationNumber)
        let document = {
            html: html,
            data: {
                ...quotationData,
                background: background,
                logoWithRing: logoWithRing,
                imgIntro: imgIntro,
                amountWithDiscount: parseFloat(quotationData['finalAmount']) - parseFloat(quotationData['discount'])
            },
            path: "public/Quotation/" + quotationId + "/" + fileName + ".pdf"
        };

        let fileLocation = ""
        await pdf.create(document, options).then(res => {
            console.log(res)
        })
        return "/Quotation/" + quotationId + "/" + fileName + ".pdf"
    }

    async getQuotationsByServiceId(serviceId) {
        return await this.Model.find({ "services.serviceName": serviceId })
    }

    async addPhotographersToEvent(request, response) {
        const quotation = await this.Model.findById(request.body.quotationId);
        const eventDataModified = [];
        let eventName = ""
        quotation.eventDetails.map((eventData) => {
            if (mongoose.Types.ObjectId(eventData._id).equals(mongoose.Types.ObjectId(request.body.eventId))) {
                // console.log("IF", eventData.eventDescription, eventData.photographerTypes, request.body.photographerData)
                eventData.photographerTypes = request.body.photographerData
                eventName = eventData.eventDescription
                eventData.isPhotographersAssigned = true
            }
            eventDataModified.push(eventData)
        })
        await this.Model.findByIdAndUpdate(request.body.quotationId, { $set: { eventDetails: eventDataModified } }, {
            upsert: true, new: true,
            setDefaultsOnInsert: true, runValidators: true
        }).then(result => {
            return response.status(200).send({ message: "Photographers Assigned Successfully for the event of " + eventName })
        }).catch(e => {
            console.log(e)
            return e
        });
    }

    async addRawDataToEvent(request, response) {
        const quotation = await this.Model.findById(request.body.quotationId);
        const eventDataModified = [];
        let eventName = ""
        quotation.eventDetails.map((eventData) => {
            if (mongoose.Types.ObjectId(eventData._id).equals(mongoose.Types.ObjectId(request.body.eventId))) {
                // console.log("IF", eventData.eventDescription, eventData.photographerTypes, request.body.photographerData)
                eventData.rawData = request.body.rawData
            }
            eventDataModified.push(eventData)
        })
        await this.Model.findByIdAndUpdate(request.body.quotationId, { $set: { eventDetails: eventDataModified } }, {
            upsert: true, new: true,
            setDefaultsOnInsert: true, runValidators: true
        }).then(result => {
            return response.status(200).send({ message: "Raw data location added Successfully for the event of " + eventName })
        }).catch(e => {
            console.log(e)
            return e
        });
    }

    async changeRawDataStatusToEvent(request, response) {
        const quotation = await this.Model.findById(request.body.quotationId);
        const eventDataModified = [];
        let eventName = ""
        quotation.eventDetails.map((eventData) => {
            if (mongoose.Types.ObjectId(eventData._id).equals(mongoose.Types.ObjectId(request.body.eventId))) {
                // console.log("IF", eventData.eventDescription, eventData.photographerTypes, request.body.photographerData)
                eventData.rawDataStatus = request.body.status
            }
            eventDataModified.push(eventData)
        })
        await this.Model.findByIdAndUpdate(request.body.quotationId, { $set: { eventDetails: eventDataModified } }, {
            upsert: true, new: true,
            setDefaultsOnInsert: true, runValidators: true
        }).then(result => {
            return response.status(200).send({ message: "Raw data location " + request.body.status + " Successfully for the event of " + eventName })
        }).catch(e => {
            console.log(e)
            return e
        });
    }

    async addCoordinateWithToEvent(request, response) {
        const quotation = await this.Model.findById(request.body.quotationId);
        const eventDataModified = [];
        let eventName = ""
        quotation.eventDetails.map((eventData) => {
            if (mongoose.Types.ObjectId(eventData._id).equals(mongoose.Types.ObjectId(request.body.eventId))) {
                eventData.coordinateWith = request.body.coordinateWith
            }
            eventDataModified.push(eventData)
        })
        await this.Model.findByIdAndUpdate(request.body.quotationId, { $set: { eventDetails: eventDataModified } }, {
            upsert: true, new: true,
            setDefaultsOnInsert: true, runValidators: true
        }).then(result => {
            return response.status(200).send({ message: "coordinate With added  Successfully for the event of " + eventName })
        }).catch(e => {
            console.log(e)
            return e
        });
    }


    async shareQuotationOnEmail(quotationId) {
        const quotationData = await this.Model.findById(quotationId).populate(['clientId', "services.serviceName"]).lean()
        quotationData['createdAt'] = moment(quotationData['createdAt']).format("DD-MM-YYYY")
        quotationData['eventDetails'] = await quotationData['eventDetails'].map((event, index) => {
            if (index > 0 && (index + 1) % 2 == 0) {
                event.isPageBreak = true
            }
            if (index > 0 && (index) % 2 == 0) {
                event.isNewPage = true
            }
            event.eventDateTime = moment(event.eventDateTime).format("DD-MM-YYYY");
            return event
        })
        quotationData['complimentaryService'] = quotationData['complimentaryService'].join(", ")

        let html = fs.readFileSync('pdfTemplates/quotation.html', 'utf8');
        let bitmap = fs.readFileSync('pdfTemplates/background.png');
        const background = bitmap.toString('base64');

        let logoBitmap = fs.readFileSync('pdfTemplates/logoWithRing.png');
        const logoWithRing = logoBitmap.toString('base64');

        let imgIntroBitmap = fs.readFileSync('pdfTemplates/iconic.png');
        const imgIntro = imgIntroBitmap.toString('base64');

        let options = {
            format: "A4",
            orientation: "portrait",
            // margin: "10mm",
        };
        let fileName = quotationData.clientId.groomName
        if (quotationData.photographyType == "Bride Side") {
            fileName = quotationData.clientId.brideName
        } else if (quotationData.photographyType == "Both") {
            fileName = quotationData.clientId.groomName + "_" + quotationData.clientId.brideName
        }
        fileName += "_" + (quotationData.quotationNumber)
        let document = {
            html: html,
            data: {
                ...quotationData,
                background: background,
                logoWithRing: logoWithRing,
                imgIntro: imgIntro,
                amountWithDiscount: parseFloat(quotationData['finalAmount']) - parseFloat(quotationData['discount'])
            },
            path: "public/Quotation/" + quotationId + "/" + fileName + ".pdf"
        };

        let fileLocation = ""
        await pdf.create(document, options).then(res => {

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
                                                        <h1>Hi, `+ quotationData.clientId.groomName + ` and ` + quotationData.clientId.brideName + `</h1>
                                                        <p><b>Thank You for contacting the Iconic Films and Photography. Please find the attached Quotation for your reference.</b></p><br>
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
                to: quotationData.clientId.email,
                subject: "Quotation of " + quotationData.title,
                html: html,
                attachments: [{
                    filename: quotationData.quotationNumber + '.pdf',
                    path: res.filename,
                    contentType: 'application/pdf'
                }]
            };
            let info = transporter.sendMail(message, function (err, info) {

                if (err) {
                    console.log("Message error: %s", err);
                }
                console.log("Mail sent to email id.")
            });
        })
        return true;
    }


}

module.exports = Quotation;
