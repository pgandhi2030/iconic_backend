
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const moment = require('moment')

const userModel = require('../database/models/user');
const mongoose = require('mongoose');

const UserController = require('../controllers/User')
const User = new UserController(mongoose.model("User", userModel));
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

const roleModel = require('../database/models/role');
const RoleController = require('../controllers/Role')
const Role = new RoleController(mongoose.model("Role", roleModel));


const roleBasedAccessModel = require('../database/models/roleBasedAccess');
const RoleBasedAccessController = require('../controllers/RoleBasedAccess')
const RoleBasedAccess = new RoleBasedAccessController(mongoose.model("RoleBasedAccess", roleBasedAccessModel));



router.post('/signIn',
    body('username').exists().withMessage('UserName is required'),
    body('password').exists().withMessage('password is required'), async (req, res) => {
        // Finds the validation errors in this request and wraps them in an object with handy functions
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        } else {
            const user = await User.signIn(req, res);
            if (user && user._id) {
                const token = jwt.sign({ userId: user._id, isActive: user.isActive }, "Developed&DesignedByP@rthG@ndhi", { algorithm: "HS256", expiresIn: '90 days' }); //90 days
                const domain = ".139.59.73.85";
                let maxAge = 7776000000

                const options = {
                    httpOnly: true, // cookie is only accessible by the server
                    maxAge: maxAge, // ex. days * hours * minutes * seconds * miliseconds
                    secure: true,
                    // sameSite: 'none', // only sent for requests to the same FQDN as the domain in the cookie.
                    domain: domain
                }
                res.cookie('token', token, options);
                user['token'] = token
                const rbac = await RoleBasedAccess.getAllByRole(user.role)
                user["rbac"] = rbac.filter(a => a.hasAccess)
                res.status(200).send(user)
            } else {
            }
        }
    })


router.post('/signUp',
    body('firstName').exists(),
    body('mobileNumber').isMobilePhone(),
    body('emailId').isEmail(),
    body('confirmPassword').isLength({ min: 5 }),
    body('password').isLength({ min: 5 }), (req, res) => {
        // Finds the validation errors in this request and wraps them in an object with handy functions
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        } else {
            User.signUp(req, res)
        }
    });

router.post('/logout', (req, res) => {
    // Finds the validation errors in this request and wraps them in an object with handy functions

    User.logOut(req, res)

})


module.exports = router;
