import { logApiError } from 'controllers/error'
import { getMyProfile, logOut, loginUser, signUpUser, userRecentSearches } from 'controllers/user'
import express from 'express'
import Joi from 'joi'
import { authenticateToken } from 'middleware/auth'
import validateFn, { reqTargetTypes } from 'validators'

const router = express.Router()

const userSignUpValidation = (req, res, next) => {
  const querySchema = Joi.object({
    name: Joi.string().min(3).max(30).required().messages({
      'string.base': `"name" should be a type of 'text'`,
      'string.empty': `"name" cannot be an empty field`,
      'string.min': `"name" should have a minimum length of {#limit}`,
      'string.max': `"name" should have a maximum length of {#limit}`,
      'any.required': `"name" is a required field`,
    }),
    email: Joi.string().email().required().messages({
      'string.email': `"email" must be a valid email`,
      'any.required': `"email" is a required field`,
    }),
    password: Joi.string().min(6).max(30).required().messages({
      'string.base': `"password" should be a type of 'text'`,
      'string.empty': `"password" cannot be an empty field`,
      'string.min': `"password" should have a minimum length of {#limit}`,
      'string.max': `"password" should have a maximum length of {#limit}`,
      'any.required': `"password" is a required field`,
    }),
  })

  validateFn(req, res, next, [{ schema: querySchema, reqTarget: reqTargetTypes.BODY }])
}

const userLoginValidation = (req, res, next) => {
  const querySchema = Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': `"email" must be a valid email`,
      'any.required': `"email" is a required field`,
    }),
    password: Joi.string().min(6).max(30).required().messages({
      'string.base': `"password" should be a type of 'text'`,
      'string.empty': `"password" cannot be an empty field`,
      'string.min': `"password" should have a minimum length of {#limit}`,
      'string.max': `"password" should have a maximum length of {#limit}`,
      'any.required': `"password" is a required field`,
    }),
  })

  validateFn(req, res, next, [{ schema: querySchema, reqTarget: reqTargetTypes.BODY }])
}

router.post('/v1/users/', userSignUpValidation, (req, res, next) => {
  signUpUser(req, res, next).catch((err) => {
    return logApiError(req, res, next, err, 500, 'Could not create user')
  })
})

router.post('/v1/users/login', userLoginValidation, (req, res, next) => {
  loginUser(req, res, next).catch((err) => {
    return logApiError(req, res, next, err, 500, 'Could not login user')
  })
})

router.get('/v1/users/myProfile', authenticateToken, (req, res, next) => {
  getMyProfile(req, res, next).catch((err) => {
    return logApiError(req, res, next, err, 500, 'Failed to get user profile')
  })
})

router.get('/v1/users/logout', authenticateToken, (req, res, next) => {
  logOut(req, res, next).catch((err) => {
    return logApiError(req, res, next, err, 500, 'Could not log out user')
  })
})

router.get('/v1/users/recent-searches', authenticateToken, (req, res, next) => {
  userRecentSearches(req, res, next).catch((err) => {
    return logApiError(req, res, next, err, 500, 'Failed to get user recent searches')
  })
})

export default router
