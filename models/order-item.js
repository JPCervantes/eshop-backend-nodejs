const mongoose = require('mongoose');

const orderItemsSchema = mongoose.Schema({
    quantity: {
        type: Number,
        required: true
    }, 
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }


})

// Model of the product api

exports.OrderItem = mongoose.model('OrderItem', orderItemsSchema);