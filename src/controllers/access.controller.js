'use strict'

const { CREATED, SuccessResponse } = require("../core/success.response")
const AccessService = require("../services/access.service")

class AccessController {

    handlerRefreshToken = async (req, res, next) => {
        const result = await AccessService.handlerRefreshToken(req.body.refreshToken)
        return new SuccessResponse({
            message: 'Get token success',
            metadata: result
        }).send(res)
    }

    login = async (req, res, next) => {
        new SuccessResponse({
            message: 'Login Success',
            metadata: await AccessService.login(req.body)
        }).send(res)
    }

    logout = async (req, res, next) => {
        new SuccessResponse({
            message: 'Logout success',
            metadata: await AccessService.logout(req.keyStore)
        }).send(res)
    }

    signUp = async (req, res, next) => {
        //console.log(`[P]::signUp::`, req.body)
        /*
        200 - ok
        201 - created
        */
        new CREATED({
            message: 'Registed ok!',
            metadata: await AccessService.signUp(req.body),
            options: {
                limit: 10
            }
        }).send(res)
    }
}

module.exports = new AccessController()

