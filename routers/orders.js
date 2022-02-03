const { Order}  = require('../models/order');
const express = require('express');
const { OrderItem } = require('../models/order-item');
const router = express.Router();

router.get(`/`, async (req, res) => {
    const orderList = await Order.find().populate('user', 'name').sort({'dateOrdered': -1});  // To populate especific fields ('table', 'row')
    if (!orderList) {                                           // to sort by a specific column
        res.status(500).json({success: false})
    }
    res.send(orderList);
})

router.get(`/:id`, async (req, res) => {
    const order = await Order.findById(req.params.id)
    .populate('user', 'name')       // To populate especific fields ('table', 'row')
    .populate({
        path: 'orderItems', populate: {              // in this case to populate an internal array
            path: 'product', populate: 'category'}
    }); 

    if (!order) {                                           // to sort by a specific column
        res.status(500).json({success: false})
    }
    res.send(order);
})

router.post(`/`, async (req, res) => {
                        // This Promise.all() get in one block all the promises, so result in one promise
    const orderItemsIds = Promise.all(req.body.orderItems.map(async orderItem => {    // This is a loop on the database throght the items to catch the quantity and product
        let newOderItem = new OrderItem({
            quantity: orderItem.quantity,
            product: orderItem.product
        })
        newOderItem = await newOderItem.save();     // Save the items in the data base
        return newOderItem._id;     // return only the id
    }))
    // This reaches the promise and resolve it.
    const orderItemsIdsResolved = await orderItemsIds; // this await make possible to operate with the next block

    const totalPrices = await Promise.all(orderItemsIdsResolved.map( async (orderItemId) => { //this loops throught the orderItemsIdsResolved
        const orderItem = await OrderItem.findById(orderItemId).populate('product', 'price'); // next find the items in orderItemId, and populate the values
        const totalPrice = orderItem.product.price * orderItem.quantity;    //Here multiplies the value of price * the quantity
        return totalPrice
    }))

    const totalPrice = totalPrices.reduce((a, b )=> a + b, 0 );  // this reduce the elements of the array, sum it
    
    let order = new Order({
        orderItems: orderItemsIdsResolved,
        shippingAddress1: req.body.shippingAddress1,
        shippingAddress2: req.body.shippingAddress2,
        city: req.body.city,
        zip: req.body.zip,
        country: req.body.country,
        phone: req.body.phone,
        status: req.body.status,
        totalPrice: totalPrice, // fetch the value obtain by reduce
        user: req.body.user,
    })

    order = await order.save();

    if(!order) 
    return res.status(400).send('The order cannot be created');

    res.send(order);
})

router.put('/:id', async (req, res) => {  // This api allows to update the category items.
    const order = await Order.findByIdAndUpdate(
        req.params.id,
        {               // This is and object with all the atributes 
            status: req.body.status,
        },
        { new: true}
    )

    if(!order) 
    return res.status(404).send('The order cannot be updated!')
    res.send(order);
})

router.delete(`/:id`, (req, res) => {
    Order.findByIdAndRemove(req.params.id).then(async order =>{
        if(order) {
            await order.orderItems.map(async orderItem => {
                await OrderItem.findByIdAndRemove(orderItem)
            })

            return res.status(200).json({success: true, message: 'The order has been deleted!'}), orderId
        } else {
            return res.status(404).json({success: false, message: 'The order cannot been found!'})
        }

    }).catch(err=> {
        return res.status(400).json({success: false, error: err})
    })
})

router.get('/get/totalsales', async (req, res) => {
    const totalSales = await Order.aggregate([
        { $group : { _id: null, totalSales: { $sum: '$totalPrice'}}} //The id is necessary to fetch the data
    ])

    if(!totalSales) {
        return res.status(404).send('The order sales cant be generated')
    }
    res.send({totalSales: totalSales.pop().totalSales});
})

router.get(`/get/count`, async (req, res) =>{
    const orderCount = await Order.countDocuments();
    if (!orderCount) {
        res.status(500).json({success: false})
    }
    res.send({
        orderCount: orderCount
    });
});


router.get(`/get/userorders/:userid`, async (req, res) => {
    const userOrderList = await Order.find({user: req.params.userid}).populate({
        path: 'orderItems', populate: {              // in this case to populate an internal array
            path: 'product', populate: 'category'}
    }).sort({'dateOrdered': -1});  // To populate especific fields ('table', 'row')
    if (!userOrderList) {                                           // to sort by a specific column
        res.status(500).json({success: false})
    }
    res.send(userOrderList);
})

module.exports = router;