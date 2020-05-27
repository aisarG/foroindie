const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const authHeader = req.get('Authorization');
    const token = authHeader.split(' ')[1]
    // console.log(token)
    // console.log(authHeader)
    console.log('arreglar el auth')
    if (token === null) {
        const error = new Error('Not authenticated');
        error.statusCode = 401;
        throw error;
    }
    let decodedToken;
    try {
        decodedToken = jwt.verify(token, 'somesupersecretsecret')
    } catch (error) {
        error.statusCode = 500;
        throw error;
    }
    if (!decodedToken) {
        const error = new Error('Token not found');
        error.statusCode = 401;
        throw error;
    }
    req.userId = decodedToken.userId;
    req.name = decodedToken.name;
    next();
}