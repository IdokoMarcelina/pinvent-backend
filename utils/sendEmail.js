const nodemailer = require('nodemailer')
console.log(nodemailer);

const sendEmail = async (subject, message, sendto, sentfrom, replyto)=>{

    const transporter = nodemailer.createTransport({
        host: process.env.SERVICE,
        port: 587,

    auth:{
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,

    },
    tls:{
        rejectUnauthorized: false
    }

    })

    const options = {
        to:  sendto,
        from: sentfrom,
        subject: subject,
        html: message,
        replyto: replyto,
    }

    transporter.sendMail(options, function (err, info){
            if(err){
                console.log(err);
                
            } else{
                console.log(info);

            }
            
    })
} 

module.exports = sendEmail