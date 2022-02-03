const Sequelize = require('sequelize');
const sequelize = require('../util/db');

const VerificationCode = sequelize.define('verificationcode', {
    code: {
        type: Sequelize.STRING,
        allowNull: false
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
    },
    exp: {
        type: Sequelize.DATE,
        allowNull: false
    }
});

module.exports = VerificationCode;
