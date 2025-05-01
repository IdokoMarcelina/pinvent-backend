const express = require("express");
const protect = require("../middleware/authmiddleware");
const { contactUs } = require("../controllers/contactController");
const router = express.Router();


router.post('/',protect,  contactUs)


module.exports = router