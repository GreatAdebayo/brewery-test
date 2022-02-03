const multer = require('multer')


module.exports = multer({
    storage: multer.diskStorage({}),
    fileFilter: (req, file, cb) => {
        /* reject image type not in(jpeg, jpg, png) format */
        if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
            cb(null, true)
        } else {
            req.fileValidationError = "Extension not supported";
            return cb(null, false, req.fileValidationError)

        }
    },
    limits: {
        fileSize: 1024 * 1024 * 5
    }

})