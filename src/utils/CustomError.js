class CustomError extends Error {
    constructor(message, status) {
        super(message); // Call the parent Error constructor
        this.status = status; // Add the status property
    }
}

module.exports = CustomError;