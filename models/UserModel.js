const mongoose = require("mongoose")
const bcrypt = require('bcryptjs')
const UserSchema = mongoose.Schema({

    name: {
        type: String,
        required: [true, "please add a name"]
    },
    email: {
        type: String,
        required: [true, "please add a name"],
        unique: true,
        trim: true,
    },

    password: {
        type: String,
        required: [true, "please add a password"],
        minLength: [6, "password must be up to 6 characters"],
        minLength: [6, "password must not be more than 23 characters"],
    },

    photo: {
        type: String,
        required : [true, "please add a photo"],
        default: "https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.pngegg.com%2Fen%2Fsearch%3Fq%3Davatar&psig=AOvVaw1IRhM03gpppOTNnu6QnDrm&ust=1739708759086000&source=images&cd=vfe&opi=89978449&ved=0CBEQjRxqFwoTCNiK2qrWxYsDFQAAAAAdAAAAABAE"
    },

    phone: {
        type: String,
        default: "+234"
    },

    bio: {
        type: String,
        maxLength: [250, "bio must not be more than 250 characters"],
        default: "bio"
    },
    
}, 
    {
        timestamps:true
    }
)

UserSchema.pre("save", async function(next){
    if(!this.isModified("password")){
        return next()
    }
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(this.password, salt)
    this.password = hashedPassword
    next();
})

const User = mongoose.model("User", UserSchema)
module.exports = User