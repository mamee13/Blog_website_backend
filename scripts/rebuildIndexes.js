const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../Models/UserModel');

dotenv.config({ path: path.join(__dirname, '../Config.env') });

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log('Connected to MongoDB');
        try {
            await User.collection.dropIndexes();
            console.log('Indexes dropped');
            await User.init(); // Rebuild indexes
            console.log('Indexes rebuilt');
        } catch (error) {
            console.error('Error:', error);
        }
        await mongoose.connection.close();
    });