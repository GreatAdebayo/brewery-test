const express = require('express')
const ExpressBrute = require("express-brute");
const MongooseStore = require("express-brute-mongoose");
const BruteForceSchema = require("express-brute-mongoose/dist/schema");
const mongoose = require("mongoose");



/* Importing express router */
const router = express.Router();
const { check } = require('express-validator');



/* To prevent too many password reset */
const model = mongoose.model("brutePasswordReset", new mongoose.Schema(BruteForceSchema));
const store = new MongooseStore(model);
const bruteforce = new ExpressBrute(store);


/* Importing controller */
const passwordResetController = require('../../controllers/signup&auth/passwordReset')



/* @route   GET api/passwordreset
   @desc    Get existing user if any, and send verification code to email
   @access  Public */
router.get('/passwordreset', [
    /* Validation rules */
    check('email')
        .trim()
        .not()
        .isEmpty().withMessage('Email Address required')
        .isEmail()
        .normalizeEmail().withMessage('Must be a valid email'),
], passwordResetController.getExistingUser)




/* @route   POST api/passwordreset
   @desc    Confirm verification code sent to email and update password
   @access  Public */
router.post('/passwordreset', [
    bruteforce.prevent, [
        //Validation rules
        check('email')
            .trim()
            .not()
            .isEmpty().withMessage('Email Address required')
            .isEmail()
            .normalizeEmail().withMessage('Must be a valid email'),
        check('code')
            .trim()
            .escape()
            .not()
            .isEmpty().withMessage('Code Required')
            .isNumeric()
            .isLength({
                max: 4
            }).withMessage('4 digit Code Required'),
        check('password').trim()
            .not()
            .isEmpty().withMessage('Password required')
            .isLength({ min: 5 }).withMessage('password must be minimum 5 length')
            .matches(/(?=.*?[A-Z])/).withMessage('At least one Uppercase')
            .matches(/(?=.*?[a-z])/).withMessage('At least one Lowercase')
            .matches(/(?=.*?[0-9])/).withMessage('At least one Number')
            .matches(/(?=.*?[#?!@$%^&*-])/).withMessage('At least one special character')
            .not().matches(/^$|\s+/).withMessage('White space not allowed')

    ]
], passwordResetController.updatePassword)







module.exports = router;





