const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../Models/UserModel');
const path = require('path');

// Load environment variables with correct path
dotenv.config({ path: path.join(__dirname, '../Config.env') });

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log('Connected to MongoDB');
        
        try {
            // Fetch all users
            const users = await User.find().select('username email');
            
            console.log('\nTotal users:', users.length);
            console.log('\nUsers list:');
            users.forEach(user => {
                console.log(`\nUsername: ${user.username}`);
                console.log(`Email: ${user.email}`);
                console.log('------------------------');
            });
        } catch (error) {
            console.error('Error fetching users:', error.message);
        }
        
        // Close the connection
        await mongoose.connection.close();
        console.log('\nDatabase connection closed');
    })
    .catch(err => console.error('MongoDB connection error:', err));