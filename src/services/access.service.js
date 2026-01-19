'use strict'
const shopModel = require("../models/shop.model")
const crypto = require('crypto')
const bcrypt = require('bcrypt')
const KeyTokenService = require("./keyToken.service")
const { createTokenPair, verifyJWT } = require("../auth/authUtils")
const { getInfoData } = require("../utils")
const { BadRequestError, AuthFailureError, ForbiddenError } = require("../core/error.response")
const { findByEmail } = require("./shop.service")
const RoleShop = {
    SHOP: 'SHOP',
    WRITER: 'WRITTER',
    EDITOR: 'EDITOR',
    ADMIN: 'ADMIN'
}


class AccessService {


    /*
        Check this token used
        khi refreshToken het han 
        neu user dung cai refreshToken de create new access token & refreshToken 
        thi dua vao dang nghi van

    */
    static handlerRefreshToken = async (refreshToken) => {

        if (!refreshToken) {
            throw new AuthFailureError('Refresh token missing')
        }

        const foundToken = await KeyTokenService.findByRefreshTokenUsed(refreshToken)
        if (foundToken) {

            const decoded = await verifyJWT(refreshToken, foundToken.publicKey)
            // console.log('decoded refresh token:', decoded)

            const { userId } = decoded

            await KeyTokenService.deleteKeyById(userId)
            throw new ForbiddenError('Please login again')
        }

        const holderToken = await KeyTokenService.findByRefreshToken(refreshToken)
        if (!holderToken) throw new AuthFailureError('Shop not registered')

        const { userId, email } = await verifyJWT(
            refreshToken,
            holderToken.publicKey
        )

        const tokens = await createTokenPair(
            { userId, email },
            holderToken.publicKey,
            holderToken.privateKey
        )

        await holderToken.updateOne({
            $set: {
                refreshToken: tokens.refreshToken
            },
            $addToSet: {
                refreshTokensUsed: refreshToken
            }
        })


        return { user: { userId, email }, tokens }
    }

    //logout
    static logout = async (keyStore) => {
        const delKey = await KeyTokenService.removeKeyById(keyStore._id)
        console.log({ delKey })
        return delKey
    }


    /*
        - Check email trong database
        - match password
        - create access token và refresh token
        - Generate tokens
        - Get data and return login
    */
    //login
    static login = async ({ email, password } = {}) => {
        const shopFound = await findByEmail({ email })
        if (!shopFound) throw new BadRequestError('Shop not registered!')

        const match = await bcrypt.compare(password, shopFound.password)
        if (!match) throw new AuthFailureError('Authentication Error!')

        // XOÁ KEY CŨ 
        await KeyTokenService.deleteKeyByUserId(shopFound._id)

        // TẠO RSA KEY PAIR 
        const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
            modulusLength: 4096,
            publicKeyEncoding: {
                type: 'pkcs1',
                format: 'pem'
            },
            privateKeyEncoding: {
                type: 'pkcs1',
                format: 'pem'
            }
        })

        // CREATE TOKEN
        const tokens = await createTokenPair(
            { userId: shopFound._id, email },
            publicKey,
            privateKey
        )

        //  SAVE KEYSTORE
        await KeyTokenService.createKeyToken({
            userId: shopFound._id,
            refreshToken: tokens.refreshToken,
            publicKey,
            privateKey
        })

        return {
            shop: getInfoData({
                fields: ['_id', 'name', 'email'],
                object: shopFound
            }),
            tokens
        }
    }

    static signUp = async ({ name, email, password } = {}) => {
        // check email exits
        const holderShop = await shopModel.findOne({ email }).lean()
        if (holderShop) {
            throw new BadRequestError('Erorr: Shop already registed!')
        }

        if (!name || !email || !password) {
            return {
                code: '400',
                message: 'Missing required fields'
            }
        }

        const passwordHash = await bcrypt.hash(password, 10)

        const newShop = await shopModel.create({
            name,
            email,
            password: passwordHash,
            roles: [RoleShop.SHOP]
        })

        if (newShop) {
            const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
                modulusLength: 4096,
                publicKeyEncoding: {
                    type: 'pkcs1',
                    format: 'pem'
                },
                privateKeyEncoding: {
                    type: 'pkcs1',
                    format: 'pem'
                }
            })

            await KeyTokenService.createKeyToken({
                userId: newShop._id,
                publicKey,
                privateKey
            })

            const tokens = await createTokenPair(
                { userId: newShop._id, email },
                publicKey,
                privateKey
            )

            return {
                code: 201,
                metadata: {
                    shop: getInfoData({
                        fields: ['_id', 'name', 'email'],
                        object: newShop
                    }),
                    tokens
                }
            }
        }

        return {
            code: 200,
            metadata: null
        }
    }
}

module.exports = AccessService