const express = require('express');
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

router.get('/', adminMiddleware, async (req, res) => {
    const admin = await Admin.find()
        .select({ password: 0 });

    res.status(200).json({
        status: 200,
        message: 'success',
        data: admin
    });
});

router.get('/:id', idAdminMiddleware, async (req, res) => {
    const admin = await Admin.finById(id)
        .select({ password: 0 });

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


router.put('/change-password', bodyAuthAdminMiddleware, async (req, res) => {
    const adminId = req.user._id;
    const admin = Admin.findById(adminId);

    if (!admin) {
        return res.status(404).json({
            status: 404,
            message: 'no such admin in the database'
        });
    } else {
        const { oldPassword, newPassword } = req.body;
        
        const valid = await bcrypt.compare(oldPassword, admin.password);

        if (!valid) {
            return res.status(400).json({
                status: 400,
                message: 'invalid inputs'
            });
        } else {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newPassword, salt);

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

router.post('/login', bodyValidator(validateLogin), async (req, res) => {
    const { email, password } = req.body;
    let admin = await Admin.findOne({ email });

    if(!admin) {
        return res.status(404).json({
            status: 404,
            message: 'invalid email or password'
        });
    } else {
        const valid = await bcrypt.compare(password, admin.password);

        if (!valid) {
            return res.status(400).json({
                status: 400,
                message: 'invalid email or password'
            })
        } else {
            const token = admin.generateToken();

            res.header('x-auth-token', token)
                .status(200).json({
                    status: 200,
                    message: 'success',
                    data: `welcome back ${ admin.username }`
                })
        }
    }
});

router.post('/register', bodyValidator(validate), async (req, res) => {
    const adminCount = await Admin.find().count();

    if (adminCount >= 2) {
        return res.status(400).json({
            status: 400,
            message: 'sorry, we cant have more than 2 admins'
        });
    } else {
        const { email, password, username } = req.body;

        let admin = await Admin.findOne({ email });
        if (admin) {
            return res.status(400).json({
                status: 400,
                message: 'theres a user witj the same email'
            });
        } else {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = bcrypt.hash(password, salt);

            admin = new Admin({
                username,
                email,
                password: hashedPassword,
                power: adminCount == 0 ? true : false
            });

            await admin.save();
            const toSend = _.pick(admin, ['email', 'password', 'username', '_id'])

            res.status(201).json({
                status: 201,
                message: 'success',
                data: toSend
            });
        }
    }
});

// ?? only the super admin
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