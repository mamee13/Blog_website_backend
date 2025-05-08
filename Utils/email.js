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
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        .email-container {
                            max-width: 600px;
                            margin: 0 auto;
                            font-family: Arial, sans-serif;
                            padding: 20px;
                            background-color: #f9f9f9;
                        }
                        .header {
                            background-color: #2563eb;
                            color: white;
                            padding: 20px;
                            text-align: center;
                            border-radius: 5px 5px 0 0;
                        }
                        .content {
                            background-color: white;
                            padding: 30px;
                            border-radius: 0 0 5px 5px;
                            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                        }
                        .verification-code {
                            background-color: #f3f4f6;
                            padding: 15px;
                            margin: 20px 0;
                            text-align: center;
                            font-size: 24px;
                            letter-spacing: 5px;
                            border-radius: 5px;
                        }
                        .footer {
                            text-align: center;
                            margin-top: 20px;
                            color: #6b7280;
                            font-size: 12px;
                        }
                    </style>
                </head>
                <body>
                    <div class="email-container">
                        <div class="header">
                            <h1 style="margin: 0;">Welcome to Blog Website</h1>
                        </div>
                        <div class="content">
                            <p>Hello,</p>
                            <p>Thank you for registering with Blog Website. To complete your registration, please use the verification code below:</p>
                            
                            <div class="verification-code">
                                <strong>${verificationCode}</strong>
                            </div>
                            
                            <p>This verification code will expire in <strong>10 minutes</strong>.</p>
                            <p>If you didn't request this verification code, please ignore this email.</p>
                        </div>
                        <div class="footer">
                            <p>This is an automated message, please do not reply to this email.</p>
                            <p>&copy; ${new Date().getFullYear()} Blog Website. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log('Verification email sent successfully');
    } catch (error) {
        console.error('Failed to send email:', error.message);
        throw error; // Propagate the error
    }
};