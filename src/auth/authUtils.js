'use strict'
const JWT = require('jsonwebtoken')
const { asyncHandler } = require('./checkAuth')
const { AuthFailureError, NotFoundError } = require('../core/error.response')
const { findByUserId } = require('../services/keyToken.service')
const { NON_AUTHORITATIVE_INFORMATION } = require('../utils/reasonPhrases')

const HEADER = {
    API_KEY: 'x-api-key',
    CLIENT_ID: 'x-client-id',
    AUTHORIZATION: 'authorization'
}

const createTokenPair = async (payload, publicKey, privateKey) => {
    const accessToken = JWT.sign(payload, privateKey, {
        algorithm: 'RS256',
        expiresIn: '2d'
    })

    const refreshToken = JWT.sign(payload, privateKey, {
        algorithm: 'RS256',
        expiresIn: '7d'
    })

    return { accessToken, refreshToken }
}



const authentication = asyncHandler(async (req, res, next) => {
    const userId = req.headers[HEADER.CLIENT_ID]
    if (!userId) throw new AuthFailureError('Invalid Request!')

    const keyStore = await findByUserId(userId)
    if (!keyStore) throw new NotFoundError('Not Found keyStore')

    const authHeader = req.headers[HEADER.AUTHORIZATION]
    if (!authHeader) throw new AuthFailureError('Invalid Request')

    const token = authHeader.split(' ')[1]
    if (!token) throw new AuthFailureError('Invalid Token Format')

    try {
        const decodeUser = JWT.verify(token, keyStore.publicKey, {
            algorithms: ['RS256']
        })

        if (userId !== decodeUser.userId) {
            throw new AuthFailureError('Invalid UserId')
        }

        req.keyStore = keyStore
        req.user = decodeUser
        return next()
    } catch (error) {
        console.error('JWT verify error:', error.message)
        throw error
    }
})


const verifyJWT = async (token, keyScret) => {
    return await JWT.verify(token, keyScret)
}

module.exports = {
    createTokenPair,
    authentication,
    verifyJWT
}