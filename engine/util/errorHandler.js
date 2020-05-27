exports.errorHandler = (status, text, errors) => {
    let error = new Error();
    if (text !== null) {
        error = new Error(text);
    }
    error.statusCode = status;
    if (errors) {
        error.data = errors.array()
    }
    throw error;
}

exports.catchError = (err, status) => {
    return (req, res, next) => {
        if (!err.statusCode) {
            err.statusCode = status;
        }
        next(err);
    }
}