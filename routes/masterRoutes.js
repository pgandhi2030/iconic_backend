
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { expressjwt } = require("express-jwt");

const mongoose = require('mongoose');

const photographerTypeModal = require('../database/models/photographerType');
const PhotographerTypeController = require('../controllers/PhotographerType')
const PhotographerType = new PhotographerTypeController(mongoose.model("PhotographerType", photographerTypeModal));

const serviceModal = require('../database/models/service');
const ServiceController = require('../controllers/Service')
const Service = new ServiceController(mongoose.model("Service", serviceModal));


const complimentaryServiceModal = require('../database/models/complimentaryService');
const ComplimentaryServiceController = require('../controllers/ComplimentaryService')
const ComplimentaryService = new ComplimentaryServiceController(mongoose.model("ComplimentaryService", complimentaryServiceModal));

const quotationModal = require('../database/models/quotation');
const QuotationController = require('../controllers/Quotation')
const Quotation = new QuotationController(mongoose.model("Quotation", quotationModal));

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

const checkAuth = require('../middleware/user-auth');


router.post('/createService', checkAuth, (req, res) => {
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    } else {
        Service.createService(req, res)
    }
})


router.get('/servicesList', checkAuth, async (req, res) => {
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    } else {
        const services = await Service.getAll()
        const response = []
        await Promise.all(services.map(async (service) => {
            const check = await Quotation.getQuotationsByServiceId(service._id)
            service['isDelete'] = ((check.length > 0) ? false : true)
            response.push(service)
        }))
        res.status(200).send(response)
    }
})

router.post('/deleteServiceById', checkAuth, (req, res) => {
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    } else {
        Service.deleteServiceById(req.body._id)
        return res.status(200).json({ message: "Service Deleted Successfully" });

    }
})



router.post('/createComplimentaryService', checkAuth, (req, res) => {
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    } else {
        ComplimentaryService.createComplimentaryService(req, res)
    }
})


router.get('/complimentaryServiceList', checkAuth, async (req, res) => {
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    } else {
        const complimentaryService = await ComplimentaryService.getAll()
        res.status(200).send(complimentaryService)
    }
})


router.post('/deleteComplimentaryServiceById', checkAuth, (req, res) => {
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    } else {
        ComplimentaryService.deleteComplimentaryServiceById(req.body._id)
        return res.status(200).json({ message: "Complimentary Service Deleted Successfully" });

    }
})


router.post('/createPhotographerType', checkAuth, (req, res) => {
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    } else {
        PhotographerType.createPhotographerType(req, res)
    }
})


router.get('/photographerTypeList', checkAuth, async (req, res) => {
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    } else {
        const photographerType = await PhotographerType.getAll()
        res.status(200).send(photographerType)
    }
})

router.post('/deletePhotographerTypeById', checkAuth, (req, res) => {
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    } else {
        PhotographerType.deletePhotographerTypeById(req.body._id)
        return res.status(200).json({ message: "Photographer Type Deleted Successfully" });

    }
})


module.exports = router;
