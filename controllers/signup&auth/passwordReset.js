const { validationResult } = require('express-validator');
const VerificationCode = require('../../models/VerificationCode')
const date = require('date-and-time');
const emailVerify = require('../email/emailVerify')
const User = require('../../models/User')
const bcrypt = require('bcryptjs');


exports.getExistingUser = async (req, res) => {
    /* Request validation */
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    try {
        const user = await User.findOne({ email, method: 'default' })

        /* Check if user exists */
        if (!user) {
            return res.status(400).json({ status: 400, msg: 'email not found or if you signed in with google, try to change your google account password' });
        }


        /* Generate verification code */
        const rand = Math.floor(1000 + Math.random() * 9000); /* 4 digit code */
        const now = new Date();
        const ten_minutes_later = date.addMinutes(now, 10); /* Expiring time 10 minutes */


        /* Save verification code in db */
        const verification = new VerificationCode({
            user: user._id,
            email,
            code: rand,
            exp: ten_minutes_later,
            type: 'email'
        })
        await verification.save();


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
        res.status(500).send('server error');
    }

}




exports.updatePassword = async (req, res) => {
    /* Request validation */
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, code, password } = req.body;

    try {

        /* Check if user exits */
        let user = await User.findOne({ email, method: 'default' })

        if (!user) {
            return res.status(400).json({ msg: 'email not found or if you signed in with google, try to change your google account password', status: 400 });
        }

        /* Fetching code from db and checking if valid */
        const check = await VerificationCode.findOne({ user: user._id, code })


        /* Check if code is correct */
        if (!check) {
            return res.status(400).json({ msg: 'incorrect code', status: 400 })
        }



        const exp_date = new Date(check.exp) /* Exp time to millisecond */
        const present_date = new Date() /* Present time to millisecond */


        /* Check if code has not expired */
        if (exp_date.getTime() > present_date.getTime()) {

            /* Password encryption */
            const salt = bcrypt.genSaltSync(10);
            newpassword = bcrypt.hashSync(password, salt);


            /* Update password */
            await User.updateOne({ _id: user._id }, {
                $set: { password: newpassword }
            })

            return res.status(200).json({ mg: 'password updated', status: 200 })


        } else {
            return res.status(400).json({ msg: 'expired code', status: 400 })
        }


    } catch (err) {
        res.status(500).send('server error');
    }

}





