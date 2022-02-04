const express = require('express');
const bodyParser = require('body-parser')
const cors = require('cors')
require('dotenv').config()
const sequelize = require('./util/db');
const errorController = require('./controllers/error')




/* Initiate express */
const app = express();


/* Body parser for incoming request */
app.use(bodyParser.json());


/* CORS */
let corsOptions = {
    origin: 'http://localhost:3001',
    optionsSuccessStatus: 200
}


/* Initiate cors */
app.use(cors(corsOptions));


/* Importing all routes */
const signupRoute = require('./routes/signup&auth/signup')
const authRoute = require('./routes/signup&auth/auth')
const profilePictureRoute = require('./routes/dashboard/profilePicture')


/* Define Routes */
app.use('/api', signupRoute)
app.use('/api', authRoute)
app.use('/api', profilePictureRoute)
app.use(errorController.get404)


/* Connect Database */
sequelize.sync(
    // { force: true }
).then(result => {
    /* Start server */
    app.listen(process.env.PORT);
})


