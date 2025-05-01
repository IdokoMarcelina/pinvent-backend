const mongoose = require("mongoose");
const asyncHandler = require("express-async-handler")
const User = require("../models/UserModel");
const Product = require("../models/ProductModel")
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');
const crypto = require("crypto");
const { upload, fileSizeFormatter } = require("../utils/fileUpload");
const cloudinary = require("../utils/cloudinary");




const createProduct = asyncHandler(async(req,res)=>{

    const {name, sku, category, quantity, price, description} = req.body
    console.log(req.body);
    if(!name || !category || !quantity || !price || !description){
        res.status(400)
        throw new Error("please fill in all fields")
    }


    let fileData = {}
    if(req.file){
        //  console.log(req.file);

        let uploadedFile

        try {
            uploadedFile = await cloudinary.uploader.upload(req.file.path

                , {folder: "pinvent-App", resource_type: "image"}
            )
        } catch (error) {
            res.status(500)
            throw new Error("Image could not be uploaded")
        }
        fileData = {
            fileName: req.file.originalname,
            filePath: uploadedFile.secure_url,
            fileType: req.file.mimetype,
            fileSize: fileSizeFormatter( req.file.size, 2),
        }
    }

    const product = await Product.create({
        user: req.user._id,
        name,
        sku,
        category,
        quantity,
        price,
        description,
        image: fileData
    })

    res.status(201).json(product)
})

const getProducts = asyncHandler(async(req,res)=>{
    const products = await Product.find({user: req.user._id}).sort("-createdAt")
    res.status(200).json(products)
})

const getSingleProduct = asyncHandler(async(req,res)=>{
 
    const product = await Product.findById(req.params.id)

    if(!product){
        res.status(404)
        throw new Error("product not found")
    }

    if(product.user.toString() !== req.user.id){
         res.status(401)
        throw new Error("user not authorized")
    }
    res.status(200).json(product);
})

const deleteProduct = asyncHandler(async (req,res)=>{
    const product = await Product.findById(req.params.id)

    if(!product){
        res.status(404)
        throw new Error("product not found")
    }
//this code is used to match the product to its user
    if(product.user.toString() !== req.user.id){
         res.status(401)
        throw new Error("user not authorized")
    }
    await product.deleteOne()
    res.status(200).json({message: "product deleted sucessfully", product});
})




const updateProduct = asyncHandler(async(req,res)=>{

    const {name, category, quantity, price, description} = req.body

    const {id} = req.params
    const product = await Product.findById(req.params.id)

    if(!product){
        res.status(404)
        throw new Error("product not found")
    }

     if(product.user.toString() !== req.user.id){
         res.status(401)
        throw new Error("user not authorized")
    }

    let fileData = {}
    if(req.file && req.file.path ){
         console.log(req.file);

        let uploadedFile

        try {
            uploadedFile = await cloudinary.uploader.upload(req.file.path

                , {folder: "pinvent-App", resource_type: "image"}
            )
        } catch (error) {
            console.error("Cloudinary Upload Error:", error);
            res.status(500)
            throw new Error("Image could not be uploaded")
        }
        fileData = {
            fileName: req.file.originalname,
            filePath: uploadedFile.secure_url,
            fileType: req.file.mimetype,
            fileSize: fileSizeFormatter( req.file.size, 2),
        }
    }
const updatedProduct = await Product.findByIdAndUpdate(
    {_id: id},
    {
        name,
        category,
        quantity,
        price,
        description,
        image: Object.keys(fileData).length === 0 ? 
                product?.image : fileData,
    },
    {
        new: true,
        runValidators: true,
    }
)

    res.status(200).json(updatedProduct)
})

module.exports = {
    createProduct,
    getProducts,
    getSingleProduct,
    deleteProduct,
    updateProduct
}