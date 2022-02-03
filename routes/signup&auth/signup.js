const express = require('express')
const { check } = require('express-validator');



/* Importing express router */
const router = express.Router();



/* Controller */
const signupController = require('../../controllers/signup&auth/signup')



/* @route   POST api/signup
   @desc    Register a new user and send confirmation code to email of new user
   @access  Public */
router.post('/signup', [
    /* Validation rules */
    check('firstname')
        .trim()
        .escape()
        .not()
        .isEmpty().withMessage('First Name required')
        .isLength({
            max: 10
        }).withMessage('Max of 10 characters required'),
    check('lastname')
        .trim()
        .escape()
        .not()
        .isEmpty().withMessage('Last Name required')
        .isLength({
            max: 10
        }).withMessage('Max of 10 characters required'),
    check('email')
        .trim()
        .not()
        .isEmpty().withMessage('Email Address required')
        .isEmail()
        .normalizeEmail().withMessage('Must be a valid email'),
    check('password')
        .not()
        .isEmpty().withMessage('Password required')
        .isLength({ min: 5 }).withMessage('password must be minimum 5 length')
        .matches(/(?=.*?[A-Z])/).withMessage('At least one Uppercase')
        .matches(/(?=.*?[a-z])/).withMessage('At least one Lowercase')
        .matches(/(?=.*?[0-9])/).withMessage('At least one Number')
        .matches(/(?=.*?[#?!@$%^&*-])/).withMessage('At least one special character')
        .not().matches(/^$|\s+/).withMessage('White space not allowed'),
], signupController.registerUser)




/* @route   POST api/sendcode
   @desc    sends verification code
   @access  Public */
   router.post('/sendcode', [
     /* Validation rules */
    check('email')
        .trim()
        .not()
        .isEmpty().withMessage('Email Address required')
        .isEmail()
        .normalizeEmail().withMessage('Must be a valid email')
], signupController.sendCode)




/* @route   GET api/confirmemail
   @desc    Confirm verification code sent to email
   @access  Public */
router.get('/signup', [
    /* Validation rules */
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
            min: 4,
            max: 4
        }).withMessage('4 digit Code Required'),
], signupController.confirmEmail)


module.exports = router;





