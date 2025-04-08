const AppError = require('../Utils/AppError');

const handleDuplicateKeyError = (err) => {
    const message = 'Email already in use';
    return new AppError(message, 400);
};

const handleValidationError = (err) => {
    const errors = Object.values(err.errors).map(el => el.message);
    const message = `Invalid input data. ${errors.join('. ')}`;
    return new AppError(message, 400);
};

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    let error = { ...err };
    error.message = err.message;

    // Handle specific errors
    if (err.code === 11000) error = handleDuplicateKeyError(err);
    if (err.name === 'ValidationError') error = handleValidationError(err);

    // Send response
    res.status(error.statusCode).json({
        status: error.status,
        message: error.message
    });
};