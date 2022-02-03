const express = require('express');
const bodyParser = require('body-parser')
require('dotenv').config()
const sequelize = require('./util/db');


/* Initiate express */
const app = express();


/* Body parser for incoming request */
app.use(bodyParser.json());


/* Importing all routes */
const signupRoute = require('./routes/signup&auth/signup')
const authRoute = require('./routes/signup&auth/auth')
const profilePictureRoute = require('./routes/dashboard/profilePicture')


/* Define Routes */
app.use('/api', signupRoute)
app.use('/api', authRoute)
app.use('/api', profilePictureRoute)


/* Connect Database */
sequelize.sync(
    // { force: true }
    ).then(result => {
    /* Start server */
    app.listen(process.env.PORT);
})


