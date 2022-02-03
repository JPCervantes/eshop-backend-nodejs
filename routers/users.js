const { User } = require('../models/user'); // Return the export as an object
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

router.get(`/`, async (req, res) => {
    const userList = await User.find().select('-passwordHash'); 
    if (!userList) {
        res.status(500).json({success: false})
    }
    res.send(userList);
})

router.get(`/:id`, async (req, res) => {
    const user = await User.findById(req.params.id).select('-passwordHash'); 
    if (!user) {
        res.status(500).json({success: false, message: 'The user with this ID cannot be found'})
    }
    res.status(200).send(user);
})


router.post(`/`, async (req, res) => {
    
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password, 10),
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        street: req.body.street,
        apartment: req.body.apartment,
        zip: req.body.zip,
        city: req.body.city,
        country: req.body.country,
    })

    category = await user.save();
    if(!user) 
    return res.status(400).send('The user cannot be register!')
    res.send(user);
})

router.post(`/register`, async (req, res) => {
    
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password, 10),
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        street: req.body.street,
        apartment: req.body.apartment,
        zip: req.body.zip,
        city: req.body.city,
        country: req.body.country,
    })

    category = await user.save();
    if(!user) 
    return res.status(400).send('The user cannot be register!')
    res.send(user);
})


router.post('/login', async (req,res) => {
    const user = await User.findOne({email: req.body.email})    // First chech if the user exists, check by email
    const secret = process.env.USER_JWT_SECRET;

    if(!user) {
        return res.status(400).send('The user not found!');
    }

    if(user && bcrypt.compareSync(req.body.password, user.passwordHash)) {  //If the user exist the password is compared with passHash
        const token = jwt.sign(
            {
                userId: user.id,        // Pass this two objects to process in the response, is loaded to the token
                isAdmin: user.isAdmin
            },
            secret,        //This is like salt, a piece to generate the token, maybe good to keep in .env
            {expiresIn: '1d'}   // The third parameter is the expiration time, it's set to 1 day.
        ) 
        res.status(200).send({user: user.email, token: token});

    } else {
        res.status(400).send('User or Password is wrong!');
    }


})

router.get(`/get/count`, async (req, res) =>{
    const userCount = await User.countDocuments();
    if (!userCount) {
        res.status(500).json({success: false})
    }
    res.send({
        userCount: userCount
    });
});

router.delete(`/:id`, (req, res) => {
    User.findByIdAndRemove(req.params.id).then(user =>{
        if(user) {
            return res.status(200).json({success: true, message: 'The user has been deleted!'})
        } else {
            return res.status(404).json({success: false, message: 'The user cannot been found!'})
        }
    }).catch(err=> {
        return res.status(400).json({success: false, error: err})
    })
})




module.exports = router;