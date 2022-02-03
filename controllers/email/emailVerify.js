const nodemailer = require('nodemailer');


const emailVerify = async (email, code, callback) => {
    const output = `<b>${code}</b>`
    try {
        let transporter = nodemailer.createTransport({
            host: process.env.HOST_NAME,
            port: 465,
            secure: true, // true for 465, false for other ports
            auth: {
                user: process.env.EMAIL, // generated ethereal user
                pass: process.env.EMAIL_PASSWORD, // generated ethereal password
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        // send mail with defined transport object
        await transporter.sendMail({
            from: `"Brewry test 👻" <${process.env.EMAIL}>`, // sender address
            to: email, // list of receivers
            subject: `Verification Code`, // Subject line
            text: "Hello world?", // plain text body
            html: output, // html body
        });

       
        callback('email sent successfully', null)
    } catch (error) {
        callback(null, error)
    }
}



module.exports = emailVerify