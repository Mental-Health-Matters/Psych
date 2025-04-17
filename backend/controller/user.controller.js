const { User } = require('../models');
const { CustomException } = require('../utils');

const deleteUser = async (request, response) => {
    const { _id } = request.params;

    try {
        const user = await User.findOne({ _id });

        if(request.userID === user._id.toString()) {
            await User.deleteOne({ _id });
            return response.send({
                error: false,
                message: 'Account successfully deleted!'
            });
        }

        throw CustomException('Invalid request!. Cannot delete other user accounts.', 403);
    }
    catch({message, status = 500}) {
        return response.status(status).send({
            error: true,
            message
        })
    }
}

const updateProfile = async (req, res) => {
    try {
        const updates = req.body;
    
        const user = await User.findByIdAndUpdate(req.userID, updates, { new: true });
    
        if (user) {
            return res.status(200).json({
                error: false,
                message: "User profile updated successfully!",
                user,
            });
        }
    
        throw CustomException("Unable to update details", 500);
    } catch (error) {
        return res.status(error.status || 500).json({
            error: true,
            message: error.message || "Something went wrong!",
        });
    }
};

module.exports = {
    deleteUser,
    updateProfile
}