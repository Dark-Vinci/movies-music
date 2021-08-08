const express = require('express');
const _ = require('lodash');
const bcrypt = require('bcrypt');

const router = express.Router();

const { 
    Admin, validate, 
    validateLogin, 
    validateChangePassword 
} = require('../model/admin');

const bodyValidator = require('../middlewares/bodyValidator');
const idVerifier = require('../middlewares/idVerifier');
const superAdminMiddleware = require('../middlewares/superAdmin');
const auth = require('../middlewares/auth');
const admin = require('../middlewares/admin');
const wrapper = require('../middlewares/wrapper');

// middleware for route handlers
const idSuperadminMiddleware = [ 
    idVerifier, auth, admin,
    superAdminMiddleware 
];
const bodyAuthAdminMiddleware = [
    bodyValidator(validateChangePassword),
    auth, admin
];

const idAdminMiddleware = [ idVerifier, auth, admin ];
const adminMiddleware = [ auth, admin ];

/*
    ALL ROUTE HANDLERS HERE SHOULD ONLY BE ACCESSIBLE TO THE ADMIN
*/

// *route handler for getting all admins in the db
router.get('/all-admin', adminMiddleware, async (req, res) => {
    const admins = await Admin.find()
        .select({ password: 0 });

    res.status(200).json({
        status: 200,
        message: 'success',
        data: admins
    });
});

// ?tested
// route handler for getting aan admin by its id
router.get('/:id', idAdminMiddleware, async (req, res) => {
    const { id } = req.params;
    const admin = await Admin.findById(id)
        .select({ password: 0 });

    //if the admin isnt in the db, a 404 response should be returned
    if (!admin) {
        return res.status(404).json({
            status: 404,
            message: 'no such admin in the db'
        });
    } else {
        res.status(200).json({
            status: 200,
            message: 'success',
            data: admin
        });
    }
});

// ?tested
// ? route handler for vhanging admin password
router.put('/change-password', bodyAuthAdminMiddleware, async (req, res) => {
    // getting the admin id from the passed token with the auth middleware
    const adminId = req.user._id;
    const admin = await Admin.findById(adminId);

    if (!admin) {
        return res.status(404).json({
            status: 404,
            message: 'no such admin in the database'
        });
    } else {
        const { oldPassword, newPassword } = req.body;
        
        // compare the admin password with the password that was sent
        const valid = await bcrypt.compare(oldPassword, admin.password);

        // if the passed password doesnt match wuth the stored password,
        // a 404 response should be sent 
        if (!valid) {
            return res.status(400).json({
                status: 400,
                message: 'invalid inputs'
            });
        } else {
            // hashing of the passed/new password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newPassword, salt);

            // setting the new password
            admin.set({
                password: hashedPassword
            });
            await admin.save();

            res.status(200).json({
                status: 200,
                message: 'success',
                data: `your new password is now ${ newPassword }`
            });
        }
    }
});

// ? route handler for logging an admin in
router.post('/login', bodyValidator(validateLogin), wrapper ( async (req, res) => {
    const { email, password } = req.body;
    let admin = await Admin.findOne({ email });

    if(!admin) {
        // if theres is no admin with the passed email, a 404 repose 
        // should be sent 
        return res.status(404).json({
            status: 404,
            message: 'invalid email or password'
        });
    } else {
        // to evalaute if the sent password is valid
        const valid = await bcrypt.compare(password, admin.password);

        if (!valid) {
            // for invalid password, 400 response is sent
            return res.status(400).json({
                status: 400,
                message: 'invalid email or password'
            })
        } else {
            // generate an auth token
            const token = admin.generateToken();

            res.header('x-auth-token', token)
                .status(200).json({
                    status: 200,
                    message: 'success',
                    data: `welcome back ${ admin.username }`
                }
            )
        }
    }
}));

// ? route handler for registering a new admin
router.post('/register', bodyValidator(validate), wrapper (async (req, res) => {
    const adminCount = await Admin.find().count();

    if (adminCount >= 2) {
        // to limit the amount of users in the db
        return res.status(400).json({
            status: 400,
            message: 'sorry, we cant have more than 2 admins'
        });
    } else {
        const { email, password, username } = req.body;

        let admin1 = await Admin.findOne({ email });
        let admin2 = await Admin.findOne({ username });

        if (admin1 || admin2) {
            // to check if an admin exist with same email or username
            // if so, a 400 respose is returned to the user
            return res.status(400).json({
                status: 400,
                message: 'theres a user with the same email or password'
            });
        } else {
            // hash the password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // initialise the new admin and set the admin to super admin
            // if no admin exist in the database
            admin1 = new Admin({
                username,
                email,
                password: hashedPassword,
                power: adminCount == 0 ? true : false
            });

            // save admin
            await admin1.save();
            const toSend = _.pick(admin1, ['email', 'username', '_id'])

            res.status(201).json({
                status: 201,
                message: 'success',
                data: toSend
            });
        }
    }
}));

// ?route handler for deleting an admin, can only be performed  
// by the superadmin
router.delete('/:id', idSuperadminMiddleware, async (req, res) => {
    const { id } = req.params;

    const admin = await Admin.findByIdAndRemove(id);

    if (!admin) {
        return res.status(404).json({
            status: 404,
            message: 'no such admin in the db'
        });
    } else {
        res.status(200).json({
            status: 200,
            message: 'success',
            data: `${ admin.username } has been deleted`
        });
    }
})

module.exports = router;