const Sequelize = require('sequelize');
const sequelize = require('../util/db');

const ProfilePicture = sequelize.define('profilepicture', {
    url: {
        type: Sequelize.STRING,
        defaultValue:null
    },
    cloudinary_id: {
        type: Sequelize.STRING
    }
});

module.exports = ProfilePicture;
