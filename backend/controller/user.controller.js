const  User  = require('../models/user.model');
const  CustomException  = require('../utils/CustomException');
const Questionnaire = require('../models/questionnaire.model');

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
        const { userId } = req.params;

        if (!userId) {
            throw CustomException("User ID is required", 400);
        }

        const { profile, questionnaire } = req.body
        
        if (!profile || !questionnaire) {
            throw CustomException("Profile and questionnaire data are required", 400);
        }
        
        const questions = {
            userId : userId,
            answer : [
                ...questionnaire.map((item) => {
                    return {
                        question: item.question,
                        selectedAnswer: item.selectedAnswer
                    }
                })
            ]
        }

        
        const user = await User.findByIdAndUpdate(userId, profile, {new: true, runValidators:true})
        const ques = await Questionnaire.findOneAndUpdate({userId: userId}, {
            $set: {
                answers: questions.answer
            }
        }, {new: true})

        return res.status(200).json({
            error: false,
            message: "Updated successfully",
            data: {
                user,
                ques
            }
        })

    } catch({message, status = 500}) {
        return response.status(status).send({
            error: true,
            message
        })
    }
};

const getUserDetails = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!userId) {
            throw CustomException("User ID is required", 400);
        }

        const details = await User.findById(userId)
        const questionnaire = await Questionnaire.findOne({ userId });

        
        if (!details || !questionnaire) {
            throw CustomException("User not found", 404);
        }

        return res.status(200).json({
            error: false,
            message: "User details fetched successfully!",
            data : {
                user: details,
                questionnaire: questionnaire,
            }
        });
    } catch (error) {
        return res.status(error.status || 500).json({
            error: true,
            message: error.message || "Internal server error",
        });
    }
}

module.exports = {
    deleteUser,
    updateProfile,
    getUserDetails,
}