const jwt = require('jsonwebtoken');
const User = require('../../models/User')

module.exports = async (req, res, next) => {
    /* Get Token fron header */
    const token = req.header('x-auth-token');

    /* Check if token */
    if (!token) {
        return res.status(401).json({ msg: 'unauthorized', status: 401 });
    }

    /* Decode token if valid */
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user;

        /* Check if user exists */
        let checkIfExists = await User.findOne({
            where: { id: req.user.id }
        });

        if (!checkIfExists)
            return res.status(400).json({ msg: 'user not found', status: 400 });


        next();

    } catch (error) {
        res.status(401).json({ msg: 'unauthorized' });

    }

}