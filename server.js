const dotenv = require("dotenv").config();
const express = require("express");
const mongoose = require('mongoose');
const bodyParser = require("body-parser");
const cors = require("cors")
const UserRoutes = require('./routes/UserRoutes');
const productRoute = require('./routes/productRoute');
const contactRoute = require('./routes/contactRoute');
const errorHandler = require('./middleware/errorMiddleware')
const cookieParser = require('cookie-parser')
const path = require('path')


const app = express()
app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(bodyParser.json())
app.use(cors({
    origin: ["http://localhost:5173", "https://pinvent-app.vercel.app"],
    credentials: true
}))
app.use(errorHandler);
app.use(cookieParser())
app.use('/uploads', express.static(path.join(__dirname, "uploads")))



app.use('/api/users', UserRoutes)
app.use('/api/products', productRoute)
app.use('/api/contact', contactRoute)

const PORT = process.env.PORT || 5000

app.get("/", (req,res)=>{

    res.send("Home page")
})


mongoose
    .connect(process.env.MONGO_URI)
    .then(()=>{
        app.listen(PORT, ()=>{
            console.log(`server running on port ${PORT}`);
            
        })

    })
    .catch((err=>{
        console.log(err);
        
    }))