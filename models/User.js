const Sequelize = require('sequelize');
const VerificationCode = require('./VerificationCode')
const sequelize = require('../util/db');

const User = sequelize.define('user', {
    firstname: {
        type: Sequelize.STRING,
        allowNull: false
    },
    lastname: {
        type: Sequelize.STRING,
        allowNull: false
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false
    },
    verified: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
});

User.hasMany(VerificationCode, { as: "verificationcodes" });

module.exports = User;
