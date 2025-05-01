const express = require("express");
const protect = require("../middleware/authmiddleware");
const { createProduct, getProducts, getSingleProduct, deleteProduct, updateProduct } = require("../controllers/productController");
const { upload } = require("../utils/fileUpload");
const router = express.Router();


router.post('/',protect, upload.single("image"), createProduct)
router.get('/getProducts',protect, getProducts)
router.get('/:id',protect, getSingleProduct)
router.delete('/deleteProduct/:id',protect, deleteProduct)
router.patch('/updateProduct/:id',protect,upload.single("image"), updateProduct)



module.exports = router