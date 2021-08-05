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
    const token = jwt.sign({ _id: this._id, power: this.power }, config.get('jwkPass'));
    return token;
}

const Admin = mongoose.model('Admin', adminSchema);

function validate(inp) {
    const schema = Joi.object({
        username: joi.string()
            .required()
            .min(2)
            .max(30),

        email: joi.string()
            .email()
            .required()
            .min(5)
            .max(50),

        password: joi.string()
            .required()
            .min(10)
            .max(50)
    });

    const result = schema.validate(inp);
    return result;
}

function validateLogin(inp) {
    const schema = Joi.object({
        email: joi.string()
            .email()
            .required()
            .min(5)
            .max(50),

        password: joi.string()
            .required()
            .min(10)
            .max(50)
    });

    const result = schema.validate(inp);
    return result;
}

function validateChangePassword(inp) {
    const schema = Joi.object({
        oldPassword: joi.string()
            .required()
            .min(10)
            .max(50),

        newPassword: joi.string()
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