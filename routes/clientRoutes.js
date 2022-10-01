
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { expressjwt } = require("express-jwt");


const mongoose = require('mongoose');

const userModel = require('../database/models/user');
const UserController = require('../controllers/User')
const User = new UserController(mongoose.model("User", userModel));

const clientDetailsModal = require('../database/models/clientDetails');
const ClientDataController = require('../controllers/ClientDetails')
const ClientData = new ClientDataController(mongoose.model("ClientData", clientDetailsModal));

const quotationModal = require('../database/models/quotation');
const QuotationController = require('../controllers/Quotation')
const Quotation = new QuotationController(mongoose.model("Quotation", quotationModal));


const photographerPayoutModal = require('../database/models/photographerPayout');
const PhotographerPayoutController = require('../controllers/PhotographerPayout')
const PhotographerPayout = new PhotographerPayoutController(mongoose.model("PhotographerPayout", photographerPayoutModal));


router.use(express.json());
router.use(express.urlencoded({ extended: true }));

const checkAuth = require('./../middleware/user-auth');
const { response } = require('express');
const axios = require('axios');


router.post('/registration', checkAuth, (req, res) => {
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    } else {
        ClientData.createClientEnquiry(req, res)
    }
})


router.get('/list', checkAuth, async (req, res) => {
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    } else {
        const clientData = await ClientData.getAll()
        res.status(200).send(clientData)
    }
})


router.post('/getById', checkAuth, async (req, res) => {
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    } else {
        const clientData = await ClientData.getClientDetailsById(req.body._id)
        res.status(200).send(clientData)
    }
})

router.post('/createQuotation', checkAuth, async (req, res) => {
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    } else {
        await Quotation.createQuotation(req, res)
    }
})

router.post('/quotationByClientId', checkAuth, async (req, res) => {
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    } else {
        const quotations = await Quotation.getQuotationsByClientId(req.body.clientId)
        res.status(200).send(quotations)
    }
})

router.post('/getQuotationById', checkAuth, async (req, res) => {
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    } else {
        const quotation = await Quotation.getQuotationById(req.body._id)

        res.status(200).send(quotation)
    }
})

router.post('/approvedQuotationsByClientId', checkAuth, async (req, res) => {
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    } else {
        const quotations = await Quotation.approvedQuotationsByClientId(req.body.clientId)
        const finalQuotations = []
        await Promise.all(quotations.map(async (quotation) => {
            const eventData = []
            await Promise.all(quotation.eventDetails.map(async (event) => {
                const payout = await PhotographerPayout.getPhotographerPayoutByEventIdAndQuotationId(event._id, quotation._id)
                event['payoutData'] = payout ? payout.photographerPayoutData : null
                eventData.push(event)
            }))
            quotation.eventDetails = eventData
            finalQuotations.push(quotation)
        }))
        res.status(200).send(finalQuotations)
    }
})


router.get('/quotationById', checkAuth, async (req, res) => {
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    } else {
        const quotations = await Quotation.getQuotationById(req.body._id)
        res.status(200).send(quotations)
    }
})

router.post('/getQuotationPDF', checkAuth, async (req, res) => {
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    } else {
        const quotations = await Quotation.getQuotationPDF(req.body._id)
        res.status(200).send(quotations)
        const shortLink = await bitly.shorten(link)
    }
})


router.post('/getQuotationPDFWithLink', checkAuth, async (req, res) => {
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    } else {
        const quotations = await Quotation.getQuotationPDF(req.body._id)
        const quotation = await Quotation.getQuotationByIdWithClient(req.body._id)

        const shortUrl = await axios.post("https://cutt.ly/api/api.php?key=9388732dc804a1afb70c856ed63c866c44906&short=" + "http://139.59.73.85/backend" + quotations)
        res.status(200).send("https://web.whatsapp.com/send?phone=91" + quotation.clientId.mobile_number + "&text=Hii,%20click%20on%20the%20link%20For%20Quotation%20" + shortUrl.data.url.shortLink)
    }
})

function generatePassword(length) {
    var result = '';
    var characters = 'ABCDE6FG89HIJKLM2345NOPQRST017UVW$%XYZabcde@#^fghijklmno!&*pqrstuvwxyz';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }
    return result;
}

router.post('/changeQuotationStatus', body('quotationId').exists(), body('clientId').exists(), checkAuth, async (req, res) => {
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    } else {
        if (req.body.status == "Approved") {
            // const password = generatePassword(10)
            // console.log(password)

            await ClientData.convertClientToProject(req.body.clientId)
        }
        return await Quotation.changeQuotationStatus(req, res)

    }
})


router.post('/shareQuotationOnEmail', checkAuth, async (req, res) => {
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    } else {
        const quotations = await Quotation.shareQuotationOnEmail(req.body._id)
        return res.status(200).json({ message: true });

    }
})

router.get('/projectList', checkAuth, async (req, res) => {
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    } else {
        const clientData = await ClientData.getAllByStatus("Project")
        res.status(200).send(clientData)
    }
})

router.post('/assignPhotographersToEvent',
    body('quotationId').exists(),
    body('clientId').exists(),
    body('eventId').exists(), checkAuth, async (req, res) => {
        // Finds the validation errors in this request and wraps them in an object with handy functions
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        } else {
            return await Quotation.addPhotographersToEvent(req, res)
        }
    }
)

router.post('/addCoordinateWithToEvent',
    body('quotationId').exists(),
    body('clientId').exists(),
    body('eventId').exists(), checkAuth, async (req, res) => {
        // Finds the validation errors in this request and wraps them in an object with handy functions
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        } else {
            return await Quotation.addCoordinateWithToEvent(req, res)
        }
    }
)

router.post('/addRawDataToEvent',
    body('quotationId').exists(),
    body('clientId').exists(),
    body('eventId').exists(), checkAuth, async (req, res) => {
        // Finds the validation errors in this request and wraps them in an object with handy functions
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        } else {
            return await Quotation.addRawDataToEvent(req, res)
        }
    }
)

router.post('/changeRawDataStatus',
    body('quotationId').exists(),
    body('clientId').exists(),
    body('eventId').exists(), checkAuth, async (req, res) => {
        // Finds the validation errors in this request and wraps them in an object with handy functions
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        } else {
            return await Quotation.changeRawDataStatusToEvent(req, res)
        }
    }
)

router.post('/addPhotographerPayout',
    body('quotationId').exists(),
    body('clientId').exists(),
    body('eventId').exists(), checkAuth, async (req, res) => {
        // Finds the validation errors in this request and wraps them in an object with handy functions
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        } else {
            return await PhotographerPayout.createPhotographerPayout(req, res)
        }
    }
)

router.post('/addPhotographerWisePayout',
    body('quotationId').exists(),
    body('clientId').exists(),
    body('eventId').exists(), checkAuth, async (req, res) => {
        // Finds the validation errors in this request and wraps them in an object with handy functions
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        } else {
            const payoutStatus = await PhotographerPayout.addPhotographerWisePayout(req.body)
            return res.status(200).json({ message: payoutStatus });
        }
    }
)

router.get('/photographerPayoutManagementList', checkAuth, async (req, res) => {
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    } else {
        const photographers = await User.getAllEmployees()
        const finalResponse = []
        // console.log  
        await Promise.all(photographers.map(async (photographer) => {
            const payouts = await PhotographerPayout.getPhotographerPayoutByPhotographerId(photographer._id)
            let photographerTotalPayment = 0
            let photographerPendingPayment = 0
            payouts.map((payout) => {
                const photographerPayouts = payout.photographerPayoutData.filter(a => mongoose.Types.ObjectId(a.photographerId).equals(mongoose.Types.ObjectId(photographer._id)))
                photographerPayouts.map((a) => {
                    if (a.status == "Pending") {
                        photographerPendingPayment += parseFloat(a.payment)
                    }
                    photographerTotalPayment += parseFloat(a.payment)
                })
            })
            photographer['photographerTotalPayment'] = photographerTotalPayment
            photographer['photographerPendingPayment'] = photographerPendingPayment
            finalResponse.push(photographer)
        }))
        res.status(200).send(finalResponse)
    }
})

router.post('/photographerEventList', checkAuth, async (req, res) => {
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    } else {
        const photographers = await User.getAllEmployees()
        const finalResponse = []
        // console.log  
        const payouts = await PhotographerPayout.getPhotographerPayoutByPhotographerId(req.body.photographerId)
        await Promise.all(payouts.map(async (payout) => {
            const event = payout.quotationId.eventDetails.find(a => a._id.equals(payout.eventId))
            const client = await ClientData.getClientDetailsById(payout.quotationId.clientId)
            const photographerPayouts = payout.photographerPayoutData.filter(a => mongoose.Types.ObjectId(a.photographerId).equals(mongoose.Types.ObjectId(req.body.photographerId)))
            photographerPayouts.map((data) => {
                finalResponse.push({
                    _id: data._id,
                    type: data.type,
                    quotationId: payout.quotationId._id,
                    clientId: payout.quotationId.clientId,
                    photographerName: data.photographerName,
                    eventId: event._id,
                    eventName: event.eventDescription,
                    eventDateTime: event.eventDateTime,
                    eventPlace: event.eventPlace,
                    payment: data.payment,
                    paymentStatus: data.status,
                    clientName: (client.groomName ? client.groomName : "") + (client.brideName ? " & " + client.brideName : "")
                })
            })
        }))
        res.status(200).send(finalResponse)
    }
})




module.exports = router;
