const mongoose = require("mongoose");
const asyncHandler = require("express-async-handler")
const User = require("../models/UserModel");
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');
const Token = require("../models/TokenModels");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
const generateToken = (id)=>{

    return jwt.sign({id}, process.env.JWT_SECRET, 
                    {expiresIn: "1d"})
}

const registerUser = asyncHandler( async (req,res)=>{
  const {name, email, password} = req.body

  if(!name || !email || !password){
    res.status(400)
    throw new Error("please fill in all required feilds")
  }

  if(password.length < 6){
     res.status(400)
    throw new Error("passwpord must be up to two characters")
  
  }

 const userExists = await User.findOne({email})

 if(userExists){
      res.status(404)
    throw new Error(" this email has already been used")
   
}

const user = await User.create({
    name,
    email,
    password,

})

const token = generateToken(user._id)


res.cookie("token", token, {
    path: "/",
    httpOnly: true,
    expires: new Date(Date.now() + 1000 * 86400),
    samesite: "none",
    secure: false
});


if(user){

    const {_id,name, email, photo, phone, bio} = user
    res.status(201).json({
        _id,
        name,
        email,
        photo,
        phone,
        bio,
        token
    })


} else{
    res.status(400)
    throw new Error("invalid user data")
}
})

const loginUser = asyncHandler(async (req,res)=>{
    const {email, password} = req.body

    if(!email || !password){
          res.status(400)
         throw new Error("please add email and password")
    }

    const user = await User.findOne({email})

    if(!user){
          res.status(400)
         throw new Error("user not found, pleasesign up")
    }

    const passwordIsCorrect = await bcrypt.compare(password, user.password)

    const token = generateToken(user._id)


    if(passwordIsCorrect){
        res.cookie("token", token, {
        path: "/",
        httpOnly: true,
        expires: new Date(Date.now() + 1000 * 86400),
        samesite: "none",
        secure: true
    });
    }

  

    if(user && passwordIsCorrect){
        const {_id,name, email, photo, phone, bio} = user
        res.status(200).json({
            _id,
            name,
            email,
            photo,
            phone,
            bio,
            token
        })
    } else{
        res.status(400)
         throw new Error("invalid email or password")
  
    }
})

const logout = asyncHandler (async (req,res)=>{
        res.cookie("token", '', {
        path: "/",
        httpOnly: true,
        expires: new Date(0),
        samesite: "none",
        secure: true
    });

    return res.status(200).json({
        message: "successfully logged out"
    })
})

const getUser = asyncHandler(async (req,res)=>{
    const user = await User.findById(req.user._id)

       if(user){
        const {_id,name, email, photo, phone, bio} = user
        res.status(200).json({
            _id,
            name,
            email,
            photo,
            phone,
            bio,
        })
    } else{
        res.status(400)
         throw new Error("User not found")
  
    }
})

const loggedInStatus = asyncHandler(async (req,res)=>{

    const token = req.cookies.token

    if(!token){
        return res.json(false)
    }

    const verified = jwt.verify(token, process.env.JWT_SECRET)
    
    if(verified){
        return res.json(true)
    }else{
        return res.json(false)
    }
})

const updateUser = asyncHandler (async (req,res)=>{
    const user = await User.findById(req.user._id)

    if(user) {
        const {_id, name, email, phone, photo, bio} = user;
        user.email = email;
        user.name = req.body.name || name;
        user.phone = req.body.phone || phone;
        user.bio = req.body.phone || bio;
        user.photo = req.body.phone || photo;
    
    const updatedUser = await user.save()
    res.status(200).json({
            _id:updatedUser._id,
            name:updatedUser.name,
            email:updatedUser.email,
            phone:updatedUser.phone,
            photo:updatedUser.photo,
            bio:updatedUser.bio,
        })
    }else{
           res.status(404)
         throw new Error("User not found")
  
    }
})
 

const changePassword = asyncHandler(async(req,res)=>{
    const user = await User.findById(req.user._id);

    if(!user){
        res.status(400)
        throw new Error("user not found, please sign up")
    
    }
    const {oldPassword, password} = req.body

    if(!oldPassword || !password) {
        res.status(400)
        throw new Error("please add old and new password")
    }

    const passwordIsCorrect = await bcrypt.compare(oldPassword, user.password)

    if(user && passwordIsCorrect){
        user.password = password
        await user.save()
        res.status(200).send("password change successful")
    }
     else{
        res.status(400);
        throw new Error("old password is incorrect")


    } 

})

const forgetPassword = asyncHandler(async (req,res)=>{

    const {email} = req.body

     console.log("Received email:", email);

    const user = await User.findOne({email})

    if(!user){
        res.status(404)
        throw new Error('user does not exist')
    }

    let resetToken = crypto.randomBytes(32).toString("hex") + user._id
    console.log(resetToken);
    
    const hashedToken = crypto
                        .createHash("sha256")
                        .update(resetToken)
                        .digest("hex")
    
    await new Token({
        userId: user._id,
        token: hashedToken,
        createdAt: Date.now(),
        expiresAt: Date.now() + 30 * (60 * 1000)
    }).save()  
    
    const resetUrl = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`
    
    const message = `
        <h2> Hello ${user.name}</h2>
        <p>Please use the url below to reset your password</p>
        <p>This is valid for only 30minues.</p>

        <a href=${resetUrl} clicktracking=off> ${resetUrl} </a>

        <p>best regards</p>
    `
    const subject = "password Reset Request"
    const sendto = user.email
    const sentfrom = process.env.EMAIL_USER

    try {
        await sendEmail(subject, message, sendto, sentfrom)
        res.status(200).json({success: true, message: "resert email sent"})
    } catch (error) {
        res.status(500)
        throw new Error('email not sent, please try again')
    }

    res.send("forgot pass") 
    
})

const resetpassword = asyncHandler(async(req,res)=>{
    const {password} = req.body
    const {resetToken} = req.params

    const hashedToken = crypto
                            .createHash("sha256")
                            .update(resetToken)
                            .digest("hex");

    const userToken = await Token.findOne({
        token: hashedToken,
        expiresAt: {$gt: Date.now()}
    })

    if(!userToken){
        res.status(404)
        throw new Error("invalid or expired token")
    }

    const user = await User.findOne({_id: userToken.userId})
    user.password = password
    await user.save()
    res.status(200).json({
        message: "password reset successful, please login"
    })
})


module.exports = {
    registerUser,
    loginUser,
    logout,
    getUser,
    loggedInStatus,
    updateUser,
    changePassword,
    forgetPassword,
    resetpassword
} 