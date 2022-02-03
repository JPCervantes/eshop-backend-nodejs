const { Product } = require('../models/product');
const express = require('express');
const { Category } = require('../models/category');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');

const FILE_TYPE_MAP = {
    'image/png': 'png',     //this is on MIME Type
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg'
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype];
        let uploadError = new Error('Invalid upload file extension');
        
        if(isValid) {
            uploadError = null      //if the file is valid got null to the error
        }
        const basePath = `./public/uploads/`;
        cb(null, basePath)       //The upload files will be here
    },
    filename: function (req, file, cb) {

        const extension = FILE_TYPE_MAP[file.mimetype];     //here check if the file have a allowed type
        const fileName = file.originalname.replace(' ', '-'); //Rename the files
        cb(null, `${fileName}-${Date.now()}.${extension}` )
    }
  })
  
  const uploadOptions = multer({ storage: storage })

// router.get(`/`, async (req, res) => {
//     const productList = await Product.find().populate('category'); // if I use select the request only returns the values on select()
//                                                                 // if use -_id it will not be display 
//     if (!productList) {
//         res.status(500).json({success: false})
//     }
//     res.send(productList);
// })

router.get(`/`, async (req, res) => {
    let filter = {}
    if(req.query.categories) {                      // This takes the parameters by query like this products?categories=12132,1231
        filter = {category: req.query.categories.split(',')}  //here split the query by ,
    }
    
    const productList = await Product.find(filter).populate('category'); // this take the objetct filter instancited up here
    if (!productList) {
        res.status(500).json({success: false})
    }
    res.send(productList);
})





router.get(`/:id`, async (req, res) => {
    const product = await Product.findById(req.params.id).populate('category'); //With populate it display a detail related field by  
    if (!product) {
        res.status(500).json({success: false})
    }
    res.send(product);
})


router.post(`/`, uploadOptions.single('image'), async (req, res) => {   //add the multer options
    const category = await Category.findById(req.body.category);
    if(!category) return res.status(400).send('Invalid category')  // This validate first if the category exist.
    
    const file = req.file;
    if(!file) return res.status(400).send('Image file not found')  // This validate first if the file exist.

    const fileName = req.file.filename;
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;

    let product = new Product({
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: `${basePath}${fileName}`,
        images: req.body.images,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured,
        dataCreated: req.body.dataCreated,
    })
    
    product = await product.save();

    if(!product) 
    return res.status(500).send('The product cannot be created');

    res.send(product);
})


router.put('/:id', async (req, res) => {  // This api allows to update the category items.
    if(!mongoose.isValidObjectId(req.params.id))  // This validate the ID from the database
        return res.status(400).send("Invalid product ID")
    
    const category = await Category.findById(req.body.category);
    if(!category) return res.status(400).send('Invalid category')  // This validate first if the category exist. 
    
    const product = await Product.findById(req.body.id);
    if(!product) return res.status(400).send('Invalid product')

    const file = req.file;

    let filePath;
    
    if(file) {
        const fileName = req.file.filename;
        const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
        const imagePath = `${basePath}${fileName}`
    } else {
        imagePath = product.image;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        {               // This is and object with all the atributes 
            name: req.body.name,
            description: req.body.description,
            richDescription: req.body.richDescription,
            image: imagePath,
            images: req.body.images,
            brand: req.body.brand,
            price: req.body.price,
            category: req.body.category,
            countInStock: req.body.countInStock,
            rating: req.body.rating,
            numReviews: req.body.numReviews,
            isFeatured: req.body.isFeatured,
            dataCreated: req.body.dataCreated,
        },
        { new: true}
    )

    if(!updatedProduct) 
    return res.status(500).send('The product cannot be updated!')
    res.send(updatedProduct);
})

router.delete(`/:id`, (req, res) => {
    Product.findByIdAndRemove(req.params.id).then(product =>{
        if(product) {
            return res.status(200).json({success: true, message: 'The product has been deleted!'})
        } else {
            return res.status(404).json({success: false, message: 'The product cannot been found!'})
        }
    }).catch(err=> {
        return res.status(400).json({success: false, error: err})
    })
})

router.get(`/get/count`, async (req, res) =>{
    const productCount = await Product.countDocuments();
    if (!productCount) {
        res.status(500).json({success: false})
    }
    res.send({
        productCount: productCount
    });
});


router.get(`/get/featured/:count`, async (req, res) =>{
    const count = req.params.count ? req.params.count : 0 // this gets the param of the request, function as and if statement

    const products = await Product.find({isFeatured: true}).limit(+count); //this is a filter // the + sing converts str to int
    if (!products) {
        res.status(500).json({success: false})
    }
    res.send(products);
});

//This put request allows to upload multiple files 
router.put(
    '/gallery-images/:id', 
    uploadOptions.array('images', 20), 
    async (req, res) => { 
        if(!mongoose.isValidObjectId(req.params.id))  // This validate the ID from the database
        return res.status(400).send("Invalid product ID")

        const files = req.files
        let imagesPaths = []
        const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;

        if(files) {
            files.map(file => {
                imagesPaths.push(`${basePath}${file.filename}`);
            })
        }
        

        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            {               // This is and object with all the atributes 
                images: imagesPaths,

            },
            { new: true}
        )
        
    if(!updatedProduct) 
        return res.status(500).send('The product cannot be updated!')
    res.send(updatedProduct);
    }
)

 
module.exports = router;