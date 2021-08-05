const mongoose = require('mongoose');
const { Schema } = require('mongoose');
const Joi = require('joi')

const postSchema = new Schema({
    title: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 50
    },

    description: {
        type: String,
        required: true,
        minlength: 10,
        maxlength: 120
    },

    createdAt: {
        type: Date,
        default: Date.now,
        required: true
    },

    likedBy: {
        type: [ mongoose.Schema.Types.ObjectId ],
        ref: 'User'
    },

    watched: {
        type: Number,
        min: 0,
        default: 0
    },

    videoLink: {
        type: String,
        required: true,
        minlength: 10,
        maxlength: 500
    },

    imageLink: {
        type: String,
        required: true,
        minlength: 10,
        maxlength: 500
    },

    isPublished: {
        type: Boolean,
        default: false,
        required: true
    }
});

const Post = mongoose.model('Post', postSchema);

function validate(inp) {
    const schema = Joi.object({
        title: Joi.string()
            .required()
            .min(2)
            .max(50),

        description: Joi.string()
            .required()
            .min(10)
            .max(120),

        videoLink: Joi.string()
            .required()
            .min(10),
            
        imageLink: Joi.string()
            .required()
            .min(10)
    });

    const result = schema.validate(inp);
    return result;
}

function validatePut(inp) {
    const schema = Joi.object({
        title: Joi.string()
            .min(2)
            .max(50),

        description: Joi.string()
            .min(10)
            .max(120)
    });

    const result = schema.validate(inp);
    return result;
}

module.exports = {
    Post,
    validate,
    postSchema,
    validatePut
}