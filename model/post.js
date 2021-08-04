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

    like: {
        type: Number,
        default: 0,
        min: 0
    },

    watch: {
        type: Number,
        default: 0,
        min: 0
    },

    videoLink: {
        type: String,
        required: true,
        min: 10,
        max: 300
    },

    imageLink: {
        type: String,
        required: true,
        min: 10,
        max: 300
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
            .max(120)
    });

    const result = schema.validate(inp);
    return result;
}

module.exports = {
    Post,
    validate,
    postSchema
}