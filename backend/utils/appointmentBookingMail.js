function appointmentBookingMailStudent(name, selectedDate, selectedTime, fee, specialization) {
    const studentSubject = `Appointment Confirmation with ${name}`

    const studentText = `Dear Student,

        This is to confirm that your appointment has been successfully booked with ${name}, a specialist in ${specialization}.

        Appointment Details:
        - Date: ${selectedDate}
        - Time: ${selectedTime}
        - Consultation Fee: $${fee}

        Please join link at your scheduled time. If you have any questions or need to reschedule, feel free to contact us in advance.

        Thank you for choosing our services.

        Best regards,  
        Psych Team`
    return {studentSubject, studentText}
}


function appointmentBookingMailPsychiatrist(studentName, selectedDate, selectedTime, questionnaireResponses) {
    const Psychsubject = `New Appointment Booked - ${studentName} on ${selectedDate}`;
  
    const Psychtext = `Dear Doctor,
  
  A new appointment has been booked with you for a student requiring consultation.
  
  Appointment Details:
  - Student Name: ${studentName}
  - Date: ${selectedDate}
  - Time: ${selectedTime}
  
  Preliminary Questionnaire (Student Response):
  ${questionnaireResponses.map((q, i) => `${i + 1}. ${q.question}\nAnswer: ${q.selectedAnswer}\n`).join('\n')}
  
  Please review the above information prior to your consultation. Feel free to reach out if you need any additional context.
  
  Best regards,  
  Psych Team`;

    return { Psychsubject, Psychtext };
  }
  

module.exports = {appointmentBookingMailStudent, appointmentBookingMailPsychiatrist}