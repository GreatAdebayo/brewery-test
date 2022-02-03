const { validationResult } = require('express-validator');
const User = require('../../models/User')
const bcrypt = require('bcryptjs');
const Notification = require('../../models/Notification')
const generateJwt = require('./jwt')
const loginNotifyMail = require('../email/loginNotify')
const { lookup } = require('geoip-lite');


exports.authenticateUser = async (req, res) => {
    /* User IP Address */
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    /* Request validation */
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;

    try {
        /* Check if email exists */
        let user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({ status: 400, msg: 'invalid credentials' });
        }

        /* Check if password match */
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ status: 400, msg: 'invalid credentials' });
        }



        /* Keep Login session in notification */
        let notify = await new Notification({
            user: user.id,
            type: 'Login Session',
            body: `You just logged in to your account`,
            userAgent: { source: req.useragent.source }
        })

        if (req.useragent.isMobile) notify.userAgent.device = 'Mobile Phone'
        if (req.useragent.isDesktop) notify.userAgent.device = 'Desktop'


        notify.save();

        /* Push into user notification array */
        user.notification.push(notify._id)
        user.save();


        /* Notify the user if Login IP address differs from known IP Address */
        if (ip !== user.userAgent.location.ip_address) {
            let location = lookup(ip)
            let suspectedLocation = {}
            if (location != null) {
                suspectedLocation.country = location.country
                suspectedLocation.city = location.city
            }
            loginNotifyMail(
                user.email,
                ip,
                suspectedLocation
            )
        }


        /* Generate JWT */
        generateJwt(user._id, (data) => {
            return res.status(200).json({ status: 200, data, msg: 'login successfully' });
        })


    } catch (error) {
        res.status(500).json({ msg: 'something is wrong, we are fixing it', status: 500 });

    }
}




exports.getLoggedInUser = async (req, res) => {
    /* Get user details */
    try {
        const user = await User.findById(req.user.id).populate(
            {
                path: 'notification',
                model: 'Notification',
                options: {
                    sort: { createdAt: -1 }
                }
            }).select('-password -date -userAgent -method -bvn -bvn_verified');
        return res.status(200).json({ data: user });
    } catch (err) {
        res.status(500).json({ msg: 'something is wrong, we are fixing it', status: 500 });
    }
}