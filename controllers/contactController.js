
const asyncHandler = require("express-async-handler")
const User = require("../models/UserModel")
const sendEmail = require("../utils/sendEmail");



const contactUs = asyncHandler (async(req,res)=>{

const {subject, message} = req.body


const user = await User.findById(req.user._id)

if(!user){
    res.status(400)
    throw new Error("user not found, please signup")
}


    const replyto = user.email
    const sendto = process.env.EMAIL_USER
    const sentfrom = process.env.EMAIL_USER

 try {
        await sendEmail(subject, message, sendto, sentfrom, replyto)
        res.status(200).json({success: true, message: " email sent"})
    } catch (error) {
        res.status(500)
        throw new Error('email not sent, please try again')
    }
})

module.exports = {contactUs}