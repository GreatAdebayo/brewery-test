const express = require('express')
const { check } = require('express-validator');
const authMiddleware = require('../../controllers/middleware/auth')



/* Importing express router */
const router = express.Router();



/* Importing controller */
const authController = require('../../controllers/signup&auth/auth')



/* @route   POST api/auth
   @desc    Authenticate user login details & get token
   @access  Public */
router.post('/auth', [
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
], authController.authenticateUser)



/* @route   GET api/auth
   @desc    Get logged in user details with token
   @access  Private */
router.get('/auth', authMiddleware, authController.getLoggedInUser)




module.exports = router;





