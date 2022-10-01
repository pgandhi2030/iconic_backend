
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { expressjwt } = require("express-jwt");
const mongoose = require('mongoose');

const userModel = require('../database/models/user');
const UserController = require('../controllers/User')
const User = new UserController(mongoose.model("User", userModel));


const roleModel = require('../database/models/role');
const RoleController = require('../controllers/Role')
const Role = new RoleController(mongoose.model("Role", roleModel));


const roleBasedAccessModel = require('../database/models/roleBasedAccess');
const RoleBasedAccessController = require('../controllers/RoleBasedAccess')
const RoleBasedAccess = new RoleBasedAccessController(mongoose.model("RoleBasedAccess", roleBasedAccessModel));


router.use(express.json());
router.use(express.urlencoded({ extended: true }));

const checkAuth = require('./../middleware/user-auth');
const { response } = require('express');

router.post('/me', checkAuth, async (req, res) => {
    const userData = await User.getUserById(req.authData.userId);
    const rbac = await RoleBasedAccess.getAllByRole(userData.role)
    userData["rbac"] = rbac.filter(a => a.hasAccess)
    res.status(200).send(userData)
});

router.post('/userKyc', checkAuth, (req, res) => {
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    } else {
        User.userKyc(req, res)
    }
})


router.post('/createUser', checkAuth, (req, res) => {
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    } else {
        User.createUser(req, res)
    }
})


router.post('/photographerApproval', checkAuth, (req, res) => {
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    } else {
        User.photographerApproval(req, res)
    }
})

router.get('/list', checkAuth, async (req, res) => {
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    } else {
        const userData = await User.getAll()
        res.status(200).send(userData)
    }
})


router.post('/createOrUpdateRoles', checkAuth, (req, res) => {
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    } else {
        Role.createOrUpdateRoles(req, res)
    }
})


router.post('/getById', checkAuth, async (req, res) => {
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    } else {
        const userData = await User.getUserById(req.body._id)
        res.status(200).send(userData)
    }
})

router.get('/roles', checkAuth, async (req, res) => {
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    } else {
        const roles = await Role.getAll()
        res.status(200).send(roles)
    }
})

router.post('/createOrUpdateRoleBasedAccess', checkAuth, async (req, res) => {
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    } else {
        await RoleBasedAccess.createOrUpdateRoleBasedAccess(req, res)
        // res.status(200).send(roles)
    }
})

router.post('/getAllRoleBasedAccesses', checkAuth, async (req, res) => {
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    } else {
        const rbac = await RoleBasedAccess.getAll()
        // res.status(200).send(roles)
        const permissions = [{
            permissionName: "Client Enquiry"
        },
        // {
        //     permissionName: "Client Approval"
        // },
        {
            permissionName: "Client Quotation Management"
        },
        {
            permissionName: "Project Management"
        },
        {
            permissionName: "Raw Data Management"
        },
        {
            permissionName: "Photographer Payout Management"
        },
        {
            permissionName: "User Management"
        },
        {
            permissionName: "Master - Services Management"
        },
        {
            permissionName: "Master - Complimentary Services Management"
        },
        {
            permissionName: "Master - Photographer Types Management"
        }]
        const roles = await Role.getAll()
        const response = []
        for (let i = 0; i < permissions.length; i++) {
            const permission = permissions[i]
            const obj = {};
            obj['permissionName'] = permission.permissionName;
            // console.log(roles);
            await Promise.all(roles.map(async (role) => {
                const myObj = {}
                myObj['role'] = role.roleName;
                const access = rbac.find(a => a.resource == permission.permissionName && a.role == role.roleName)
                myObj['checked'] = access ? access.hasAccess : false;
                obj[role.roleName] = myObj
            }))
            response.push(obj);
        }
        console.log(response)
        return res.status(200).json({ data: response });
    }
})

module.exports = router;
