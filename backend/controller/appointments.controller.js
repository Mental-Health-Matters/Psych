const appointmentBookingMailStudent = require('../utils/appointmentBookingMail')
const mailService = require('../utils/mailService')
const jwt = require('jsonwebtoken')
const User = require('../models/user.model')
const customException = require('../utils/CustomException')
const Questionnaire = require('../models/questionnaire.model')
const confirmation = async (req, res) => {
    const {doctor, selectedDate, selectedTime} = req.body
    const {name, specialization, fee} = doctor
    const docemail = doctor.email

    const token = req.cookies.accessToken;
    if (!token) {
        throw customException("Not logged in", 401);
    }
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload._id)
    const {email, firstName, lastName} = user
    console.log(user._id)
    const questionnaire = await Questionnaire.findOne({userId: user._id})
    
    console.log(questionnaire)

    if (!questionnaire) {
        throw customException("Questionnaire not found", 400);
    }

    const {studentSubject, studentText} = appointmentBookingMailStudent(name, selectedDate, selectedTime, fee, specialization, username)
    const {psychSubject, psychText} = appointmentBookingMailPsych(studentName, selectedDate, selectedTime, questionnaireResponses)
    const mailStudent = await mailService(email, studentSubject, studentText)
    const mailPsychiatrist = await mailService(docemail, psychSubject, psychText)
    if(!mailStudent.success) {
        throw customException("Unable to send email for appointment", 500)
    }

    return res.status(200).json({
        success: true,
        message: "Email sent successfully"
    })
}

module.exports = {
    confirmation
}