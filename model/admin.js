const mongoose = require('mongoose');
const { Schema } = require('mongoose');
const Joi = require('joi');
const config = require('config');
const jwt = require('jsonwebtoken');

const adminSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        minlength: 2,
        maxlength: 30
    },

    email: {
        type: String,
        required: true,
        unique: true,
        minlength: 5,
        maxlength: 50
    },

    password: {
        type: String,
        required: true,
        minlength: 20,
        maxlength: 1024
    },

    power: {
        type: Boolean,
        default: false,
        required: true
    }
});

adminSchema.methods.generateToken = function () {
    const token = jwt.sign({ _id: this._id, power: this.power, isAdmin: true }, config.get('jwtPass'));
    return token;
}

const Admin = mongoose.model('Admin', adminSchema);

function validate(inp) {
    const schema = Joi.object({
        username: Joi.string()
            .required()
            .min(2)
            .max(30),

        email: Joi.string()
            .email()
            .required()
            .min(5)
            .max(50),

        password: Joi.string()
            .required()
            .min(10)
            .max(50)
    });

    const result = schema.validate(inp);
    return result;
}

function validateLogin(inp) {
    const schema = Joi.object({
        email: Joi.string()
            .email()
            .required()
            .min(5)
            .max(50),

        password: Joi.string()
            .required()
            .min(10)
            .max(50)
    });

    const result = schema.validate(inp);
    return result;
}

function validateChangePassword(inp) {
    const schema = Joi.object({
        oldPassword: Joi.string()
            .required()
            .min(10)
            .max(50),

        newPassword: Joi.string()
            .required()
            .min(10)
            .max(50)
    });

    const result = schema.validate(inp);
    return result;
}

module.exports = {
    Admin,
    validate,
    adminSchema,
    validateLogin,
    validateChangePassword
}