const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../Config.env') });

const createTransporter = async () => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',  // Specify the service explicitly
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_APP_PASSWORD
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        // Verify the connection
        await transporter.verify();
        return transporter;
    } catch (error) {
        console.error('Email configuration error:', error.message);
        return null;
    }
};

module.exports = createTransporter;