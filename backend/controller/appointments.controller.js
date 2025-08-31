const { appointmentBookingMailStudent, appointmentBookingMailPsychiatrist } = require('../utils/appointmentBookingMail')
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
    console.log("Token from cookies:", token);
    if (!token) {
        throw customException("Not logged in", 401);
    }
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    console.log(payload._id)
    
    
    const user = await User.findById(payload._id)
    console.log(user)
    const {username, email, firstName, lastName} = user


    const questionnaire = await Questionnaire.findOne({userId: user._id})
    if (!questionnaire) {
        throw customException("Questionnaire not found", 400);
    }
    const questionnaireResponses = questionnaire.answers

    const {studentSubject, studentText} = appointmentBookingMailStudent(name, selectedDate, selectedTime, fee, specialization, username)

    const studentName = firstName + " " + lastName
    const {psychSubject, psychText} = appointmentBookingMailPsychiatrist(studentName, selectedDate, selectedTime, questionnaireResponses)
    const mailStudent = await mailService(email, studentSubject, studentText)
    const mailPsychiatrist = await mailService(docemail, psychSubject, psychText)
    
    console.log(mailStudent)
    if(!mailStudent.success) {
        throw customException("Unable to send email for appointment to student", 500)
    }

    if(!mailPsychiatrist.success) {
        throw customException("Unable to send email for appointment to psychiatrist", 500)
    }

    return res.status(200).json({
        success: true,
        message: "Email sent successfully"
    })
}

module.exports = {
    confirmation
}