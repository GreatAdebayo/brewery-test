const express = require('express')
const upload = require('../../controllers/middleware/multer')
const authMiddleware = require('../../controllers/middleware/auth')


/* Importing express router */
const router = express.Router();



/* Controller */
const profilePictureController = require('../../controllers/dashboard/profilePicture')



/* @route   POST api/profile-picture
   @desc    Add shop logo
   @access  Private */
router.post('/profile-picture', authMiddleware, upload.single('profilePicture'), profilePictureController.addProfilePicture)


module.exports = router;

