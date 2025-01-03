const { default: mongoose } = require("mongoose");
const validator = require('validator');

const userSchema = new mongoose.Schema({
    username: { 
        type: String, 
        required: true, 
        unique: true,
        minlength: 3,
        maxlength: 50
    },
    email: { 
        type: String, 
        required: true, 
        unique: true,
        validate: [validator.isEmail, 'Please provide a valid email']
    },
    password: { 
        type: String, 
        required: true,
        minlength: 6,
        maxlength: 10,
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please confirm your password'],
        validate: {
          // This only works on CREATE and SAVE!!!
          validator: function (el) {
            return el === this.password;
          },
          message: 'Passwords are not the same!'
        }
      },
    role: { 
        type: String, 
        enum: ['user', 'admin'], 
        default: 'user' 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
},
    {
        toJSON: {
            virtuals: true
        },
        toObject: {
            virtuals: true
        }
    },
);

userSchema.pre('save', async function(next) {
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;
    next();
});


const User = mongoose.model('user', userSchema);

module.exports = User;