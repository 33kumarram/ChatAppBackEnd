const jwt = require('jsonwebtoken')
const user = require('../models/userModel')
const errorHandler = require('express-async-handler')

const authorize = errorHandler(async function (req, res, next) {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        try {

            token = req.headers.authorization.split(' ')[1]
            console.log(token)
            const decoded = jwt.verify(token, process.env.JWT_SECRET)
            req.user = await user.findById(decoded.id).select('-password')
            next();

        } catch (error) {

            res.status(401)
            throw new Error('Authorization failed')

        }
    }
    if (!token) {
        res.status(401)
        throw new Error('Authorization token not found')
    }
})

module.exports =  authorize 