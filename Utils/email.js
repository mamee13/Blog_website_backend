const createTransporter = require('./emailConfig');

exports.sendVerificationEmail = async (email, verificationCode) => {
    try {
        const transporter = await createTransporter();
        
        if (!transporter) {
            throw new Error('Email transporter not available');
        }

        const mailOptions = {
            from: `Blog Website <${process.env.EMAIL_FROM}>`,
            to: email,
            subject: 'Email Verification',
            text: `Your verification code is: ${verificationCode}`,
            html: `
                <h1>Welcome to Blog Website!</h1>
                <p>Your verification code is: <strong>${verificationCode}</strong></p>
                <p>This code will expire in 10 minutes.</p>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log('Verification email sent successfully');
    } catch (error) {
        console.error('Failed to send email:', error.message);
        throw error; // Propagate the error
    }
};