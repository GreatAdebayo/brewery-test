const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const date = require('date-and-time');
const emailVerify = require('../email/emailVerify')
const generateJwt = require('./jwt')
const User = require('../../models/User')
const VerificationCode = require('../../models/VerificationCode')



exports.registerUser = async (req, res) => {
    /* Request validation */
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { firstname, lastname, email, password } = req.body;



    try {
        /* Check if email exists */
        let user = await User.findOne({
            where: { email }
        });
        if (user)
            return res.status(400).json({ status: 400, msg: 'email already in use' })


        /* Creating new user */
        /* Password encryption and Save to DB  */
        const salt = bcrypt.genSaltSync(10);

        let userDetails = await User.create({
            firstname,
            lastname,
            email,
            password: bcrypt.hashSync(password, salt)
        })



        /* Generate and save verification code in db */
        const rand = Math.floor(1000 + Math.random() * 9000); /* 4 digit code */
        const now = new Date();
        const ten_minutes_later = date.addMinutes(now, 10); /* Expiring time 10 minutes */

        await VerificationCode.create({
            email: userDetails.email,
            code: rand,
            exp: ten_minutes_later
        })


        /* Send code to email */
        emailVerify(userDetails.email, rand, (data, err) => {
            if (data)
                return res.status(200).json({
                    status: 200,
                    email: userDetails.email,
                    msg: 'verification code sent'
                })


            if (err)
                return res.status(400).json({
                    status: 400,
                    msg: 'something went wrong'
                })
        });

    } catch (err) {
        res.status(500).json({ msg: 'something is wrong, we are fixing it', status: 500 });
    }
}




exports.sendCode = async (req, res) => {
    /* Request validation */
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body

    try {
        /* Check if user exists */
        let user = await User.findOne({
            where: { email }
        });

        if (!user)
            return res.status(400).json({ msg: 'user not found', status: 400 });


        /* Generate verification code */
        const rand = Math.floor(1000 + Math.random() * 9000); /* 4 digit code */
        const now = new Date();
        const ten_minutes_later = date.addMinutes(now, 10); /* Expiring time 10 minutes */


        /* Save verification code in db */
        await VerificationCode.create({
            email: user.email,
            code: rand,
            exp: ten_minutes_later
        })


        /* Send code to email */
        emailVerify(user.email, rand, (data, err) => {
            if (data)
                return res.status(200).json({
                    status: 200,
                    email: user.email,
                    msg: 'verification code sent'
                })


            if (err)
                return res.status(400).json({
                    status: 400,
                    msg: 'something went wrong'
                })
        });

    } catch (err) {
        res.status(500).json({ msg: 'something is wrong, we are fixing it', status: 500 });
    }

}





exports.confirmEmail = async (req, res) => {
    /* Request validation */
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, code } = req.body;

    try {
        /* Check if user exists */
        let user = await User.findOne({
            where: { email }
        });

        if (!user)
            return res.status(400).json({ msg: 'user not found', status: 400 });

        /* Check if  email already verified */
        if (user.verified)
            return res.status(400).json({ status: 400, msg: 'email already verified' })



        /* Fetching code from db and checking if valid */
        const check = await VerificationCode.findOne({
            where: { email: email, code }
        })

        /* Check if code is correct */
        if (!check)
            return res.status(400).json({ status: 400, msg: 'incorrect code' })


        const exp_date = new Date(check.exp) /* Exp time to millisecond */
        const present_date = new Date() /* Present time to millisecond */


        /* Check if code has not expired */
        if (exp_date.getTime() > present_date.getTime()) {

            /* Update email_verification status */
            await User.update(
                { verified: true },
                { where: { id: user.id } }
            )


            /* Generate JWT */
            generateJwt(user.id, (token) => {
                return res.status(200).json({ status: 200, token, msg: 'successfully created' });
            })

        }
        else {
            return res.status(400).json({ status: 400, msg: 'expired code' })
        }

    } catch (err) {
        res.status(500).json({ msg: 'something is wrong, we are fixing it', status: 500 });
    }

}

