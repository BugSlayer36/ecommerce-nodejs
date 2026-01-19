'use strict'

const express = require('express')
const accessController = require('../../controllers/access.controller')
const { asyncHandler } = require('../../auth/checkAuth')
const { authentication } = require('../../auth/authUtils')
const router = express.Router()


//sign up
router.post('/shop/signup', asyncHandler(accessController.signUp))
//login
router.post('/shop/login', asyncHandler(accessController.login))

// refreshToken
router.post('/shop/handlerRefreshToken', asyncHandler(accessController.handlerRefreshToken))
//authentication
router.use(authentication)

//logout 
router.post('/shop/logout', asyncHandler(accessController.logout))


module.exports = router