const { validationResult } = require('express-validator');
const User = require('../../models/User')
const bcrypt = require('bcryptjs');
const generateJwt = require('./jwt')



exports.authenticateUser = async (req, res) => {
    /* Request validation */
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;

    try {
        /* Check if user exists */
        let user = await User.findOne({
            where: { email }
        });

        if (!user)
            return res.status(400).json({ msg: 'invalid credentials', status: 400 });

        /* Check if password match */
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
            return res.status(400).json({ status: 400, msg: 'invalid credentials' });


        /* Generate JWT */
        generateJwt(user.id, (data) => {
            return res.status(200).json({ status: 200, data, msg: 'login successfully' });
        })


    } catch (error) {
        res.status(500).json({ msg: 'something is wrong, we are fixing it', status: 500 });

    }
}




exports.getLoggedInUser = async (req, res) => {
    /* Get user details */
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: {
                exclude: ['password']
            }
        })
        return res.status(200).json({ data: user });
    } catch (err) {
        res.status(500).json({ msg: 'something is wrong, we are fixing it', status: 500 });
    }
}