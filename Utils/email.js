const createTransporter = require('./emailConfig');

exports.sendVerificationEmail = async (email, verificationCode) => {
    try {
        const transporter = await createTransporter();
        
        const mailOptions = {
            from: `Blog App <${process.env.EMAIL_FROM}>`,
            to: email,
            subject: 'Email Verification',
            html: `
                <h1>Email Verification</h1>
                <p>Your verification code is: <strong>${verificationCode}</strong></p>
                <p>This code will expire in 10 minutes.</p>
            `
        };

        const result = await transporter.sendMail(mailOptions);
        console.log('Email sent:', result);
        return result;
    } catch (error) {
        console.error('Send email error:', error);
        throw new Error('Failed to send verification email');
    }
};