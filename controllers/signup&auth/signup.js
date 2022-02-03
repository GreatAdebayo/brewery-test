const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const date = require('date-and-time');
const emailVerify = require('../email/emailVerify')
// const generateJwt = require('./jwt')
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


        /* Creating new user,
         Password encryption and Save to DB  */
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
            userId: userDetails.id,
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
        const user = await User.findOne({ email })

        if (!user) {
            return res.status(400).json({ msg: 'email not found', status: 400 });
        }

        /* Check if query params are correct */
        if (!(req.query.emailverify || req.query.mobileverify)) {
            return res.status(400).json({ status: 400, msg: 'something went wrong' });
        }

        /* Generate verification code */
        const rand = Math.floor(1000 + Math.random() * 9000); /* 4 digit code */
        const now = new Date();
        const ten_minutes_later = date.addMinutes(now, 10); /* Expiring time 10 minutes */


        /* Save verification code in db */
        const verification = new VerificationCode({
            user: user._id,
            code: rand,
            exp: ten_minutes_later
        })

        /* Checking Code Type */
        if (req.query.emailverify)
            verification.type = 'email'

        if (req.query.mobileverify)
            verification.type = 'mobile'

        await verification.save();


        /* Send code to email */
        if (req.query.emailverify) {
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
        }

        /* Send code to mobile number */
        if (req.query.mobileverify) {
            mobileVerify(user.mobile, rand, (data, err) => {
                if (data)
                    return res.status(200).json(
                        {
                            status: 200,
                            mobile: user.mobile,
                            msg: 'verification code sent'
                        }
                    )

                if (err)
                    return res.status(400).json(
                        {
                            status: 400,
                            msg: 'something went wrong'
                        }
                    )

            })

        }

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
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({ status: 400, msg: 'email not found' });
        }



        /* Check if  email already verified */
        if (user.email_verified) {
            return res.status(400).json({ status: 400, msg: 'email already verified' })
        }



        /* Fetching code from db and checking if valid */
        const check = await VerificationCode.findOne({ user: user._id, code, type: 'email' })

        /* Check if code is correct */
        if (!check) {
            return res.status(400).json({ status: 400, msg: 'incorrect code' })
        }


        const exp_date = new Date(check.exp) /* Exp time to millisecond */
        const present_date = new Date() /* Present time to millisecond */


        /* Check if code has not expired */
        if (exp_date.getTime() > present_date.getTime()) {



            /* Update email_verification status */
            await User.updateOne({ _id: user._id }, {
                $set: { email_verified: true }
            })


            /* Generate JWT */
            generateJwt(user._id, (data) => {
                return res.status(200).json({ status: 200, data, msg: 'successfully created' });
            })

        }
        else {
            return res.status(400).json({ status: 400, msg: 'expired code' })
        }

    } catch (err) {
        res.status(500).json({ msg: 'something is wrong, we are fixing it', status: 500 });
    }

}


exports.confirmMobile = async (req, res) => {
    /* Request validation */
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { mobile, code } = req.body;

    try {
        /* Check if user exists number */
        const user = await User.findOne({ mobile })
        if (!user) {
            return res.status(400).json({ status: 400, msg: 'user not found' });
        }



        /* Check if  mobile already verified */
        if (user.mobile_verified) {
            return res.status(400).json({ status: 400, msg: 'phone number already verified' })
        }



        /* Fetching code from db and checking if valid */
        const check = await VerificationCode.findOne({ user: user._id, code, type: 'mobile' })

        /* Check if code is correct */
        if (!check) {
            return res.status(400).json({ status: 400, msg: 'incorrect code' })
        }


        const exp_date = new Date(check.exp) /* Exp time to millisecond */
        const present_date = new Date() /* Present time to millisecond */


        /* Check if code has not expired */
        if (exp_date.getTime() > present_date.getTime()) {



            /* Update mobile_verification status */
            await User.updateOne({ _id: user._id }, {
                $set: { mobile_verified: true }
            })

            return res.status(200).json({ status: 200, msg: 'successfully verified' });

        }
        else {
            return res.status(400).json({ status: 400, msg: 'expired code' })
        }

    } catch (err) {
        res.status(500).json({ msg: 'something is wrong, we are fixing it', status: 500 });
    }

}


exports.addMobile = async (req, res, next) => {
    /* Request validation */
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { mobile } = req.body

    try {
        /* Check if number exists */
        let user = await User.findOne({ mobile });
        if (user) {
            return res.status(400).json({ status: 400, msg: 'mobile number already in use' })
        }

        /* Check if user has mobile number */
        user = await User.findOne({ _id: req.user.id })
        if (user.mobile) {
            return res.status(400).json({ status: 400, msg: 'you have a number already' });
        }


        /* Update Phone number */
        await User.updateOne({ _id: req.user.id }, {
            $set: { mobile: mobile }

        })


        return res.status(200).json({ msg: 'succesfully added', status: 200 })


    } catch (error) {
        res.status(500).json({ msg: 'something is wrong, we are fixing it', status: 500 });
    }


}