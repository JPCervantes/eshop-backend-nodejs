const mongoose = require('mongoose');

const categorySchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    icon: {
        type: String
    },
    color: {
        type: String
    },
    
})

// Model of the product api

exports.Category = mongoose.model('Category', categorySchema);