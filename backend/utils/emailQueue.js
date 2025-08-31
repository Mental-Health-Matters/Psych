// queues/emailQueue.js
const Queue = require('bull');
const sendOTP = require('../utils/mailService');
const otpMail = require('../utils/otpMail');
const User = require('../models/user.model');

// Create Redis connection (use your Redis URL from environment)
const emailQueue = new Queue('email processing', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
  },
  defaultJobOptions: {
    removeOnComplete: 10,
    removeOnFail: 5,
  }
});

// Process email jobs
emailQueue.process('sendOTP', async (job) => {
  const { email, otp, username, userId } = job.data;
  
  try {
    console.log(`Processing OTP email for user: ${userId}, email: ${email}`);
    
    const { subject, text } = otpMail(otp, username);
    
    // Add more detailed logging
    console.log(`Attempting to send email with subject: ${subject}`);
    console.log(`OTP: ${otp}`);
    
    const result = await sendOTP(email, subject, text);
    
    console.log(`Email service result:`, result);
    
    if (!result.success) {
      throw new Error(`Email sending failed: ${result.message || 'Unknown error'}`);
    }
    
    console.log(`✅ OTP email sent successfully to: ${email}`);
    return { success: true, message: 'OTP email sent successfully' };
    
  } catch (error) {
    console.error(`❌ Failed to send OTP email to ${email}:`, error);
    
    // Update user record to mark email as failed for debugging
    try {
      await User.findByIdAndUpdate(userId, { 
        emailSendFailed: true,
        lastEmailError: error.message 
      });
    } catch (updateError) {
      console.error('Failed to update user email status:', updateError);
    }
    
    throw error;
  }
});

// Enhanced event listeners for better debugging
emailQueue.on('completed', (job, result) => {
  console.log(`✅ Email job ${job.id} completed successfully:`, result);
});

emailQueue.on('failed', (job, err) => {
  console.error(`❌ Email job ${job.id} failed:`, err.message);
  console.error('Job data:', job.data);
});

emailQueue.on('stalled', (job) => {
  console.warn(`⚠️ Email job ${job.id} stalled`);
});

emailQueue.on('active', (job) => {
  console.log(`🔄 Email job ${job.id} started processing`);
});

// Add queue stats monitoring
emailQueue.on('waiting', (jobId) => {
  console.log(`⏳ Email job ${jobId} is waiting`);
});

module.exports = emailQueue;