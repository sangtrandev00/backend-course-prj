class CustomError extends Error {
  constructor(errorType, message) {
    super();
    this.errorType = errorType;
    this.message = message;
  }
}

module.exports = CustomError;
