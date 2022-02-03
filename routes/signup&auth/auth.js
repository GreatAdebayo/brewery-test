const express = require('express')
const { check } = require('express-validator');
const emailMiddleware  = require('../../middlewares/emailauth')
const ExpressBrute = require("express-brute");
const MongooseStore = require("express-brute-mongoose");
const BruteForceSchema = require("express-brute-mongoose/dist/schema");
const mongoose = require("mongoose");



/* To prevent too many login attempts */
const model = mongoose.model("bruteLogin", new mongoose.Schema(BruteForceSchema));
const store = new MongooseStore(model);
const bruteforce = new ExpressBrute(store);


/* Importing express router */
const router = express.Router();


/* Importing controller */
const authController = require('../../controllers/signup&auth/auth')



/* @route   POST api/auth
   @desc    Authenticate user login details & get token
   @access  Public */
router.post('/auth', [
    bruteforce.prevent, [
        /* Validation rules */
        check('email')
            .trim()
            .not()
            .isEmpty().withMessage('Email Address required')
            .isEmail()
            .normalizeEmail().withMessage('Must be a valid email'),
        check('password')
            .trim()
            .not()
            .isEmpty().withMessage('Password required')
    ]
], authController.authenticateUser)



/* @route   GET api/auth
   @desc    Get logged in user details with token
   @access  Private */
router.get('/auth', emailMiddleware, authController.getLoggedInUser)




module.exports = router;





