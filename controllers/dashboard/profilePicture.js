const cloudinary = require('../../util/cloudinary')
const ProfilePicture = require('../../models/ProfilePicture')



exports.addProfilePicture = async (req, res, next) => {
    /* If file is empty */
    if (!req.file) 
    return res.status(400).json({ status: 400, msg: 'no picture found' })

    const { path } = req.file

    /* Image upload error */
    if (req.fileValidationError)
        return res.status(400).json({ status: 400, msg: req.fileValidationError })

    try {
        let upload = await ProfilePicture.findOne({
            where: { userId: req.user.id }
        })

        if (upload) {
            /* Delete old picture from cloudinary */
            await cloudinary.uploader.destroy(upload.cloudinary_id, { folder: 'profilePicture' }, async (error, result) => {
                if (!error) {
                    /* Upload new profile picture to cloudinary */
                    await cloudinary.uploader.upload(path, { folder: 'profilePicture' }, async (error, result) => {
                        if (!error) {
                            /* Update profile picture in db */
                            upload = await ProfilePicture.update(
                                {
                                    url: result.secure_url,
                                    cloudinary_id: result.public_id
                                },
                                { where: { userId: req.user.id } }
                            )
                            return res.status(200).json({ status: 200, msg: 'picture uploaded' })
                        }
                    });
                }


            })
        } else {
            /* Upload profile picture to cloudinary */
            await cloudinary.uploader.upload(path, { folder: 'profilePicture' }, async (error, result) => {
                if (!error) {
                    upload = await ProfilePicture.create({
                        userId: req.user.id,
                        url: result.secure_url,
                        cloudinary_id: result.public_id
                    })
                    return res.status(200).json({ status: 200, msg: 'picture uploaded' })
                }
            });
        }
    } catch (error) {
        res.status(500).json({ msg: 'something is wrong, we are fixing it', status: 500 });
    }
}