const apiErrorHandler = require('./error-handler')

function errorHandler(err, req, res, next) {

    if(err instanceof apiErrorHandler) {
        res.status(err.code).json({message: 'error code from instance'});
        return;
    }

    res.status(500).json('Something went wrong');
}

module.exports = errorHandler;