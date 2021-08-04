const mongoose = require('mongoose');
const { Schema } = require('mongoose');
const Joi = require('joi');
const config = require('config');
const jwt = require('jsonwebtoken');

const userSchema = new Schema({
    firstName: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 30
    },

    lastName: {
        type: String,
        required: true,
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
        minlegth: 20,
        maxlength: 1024
    },

    likedMovies: {
        type: [ mongoose.Schema.Types.ObjectId ],
        ref: 'Post'
    },

    watchedMovies: {
        type: [ mongoose.Schema.Types.ObjectId ],
        ref: 'Post'
    },

    watchLater: {
        type: [ mongoose.Schema.Types.ObjectId ],
        ref: 'Post'
    }
});

userSchema.methods.generateToken = function () {
    const token = jwt.sign({ _id: this._id }, config.get('jwkPass'));
    return token;
}

const User = mongoose.model('User', userSchema);

function validate(inp) {
    const schema = Joi.object({
        firstName: Joi.string()
            .required()
            .min(2)
            .max(50),

        lastName: Joi.string()
            .required()
            .min(2)
            .max(50),

        email: Joi.string()
            .required()
            .email()
            .min(5)
            .max(50),

        password: Joi.string()
            .required()
            .minlength(7)
            .max(50)
    });

    const result = schema.validate(inp);
    return result;
}

function validatePasswordChange(inp) {
    const schema = Joi.object({
        oldPassword: Joi.string()
            .required()
            .minlength(7)
            .max(50),

        newPassword: Joi.string()
            .minlength(7)
            .required()
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
            .minlength(7)
            .max(50),

        password: Joi.string()
            .required()
            .minlength(7)
            .max(50)
    });

    const result = schema.validate(inp);
    return result;
}

module.exports = {
    User,
    validate,
    userSchema,
    validateLogin,
    validatePasswordChange
}