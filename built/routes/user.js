"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const error_1 = require("controllers/error");
const user_1 = require("controllers/user");
const express_1 = __importDefault(require("express"));
const joi_1 = __importDefault(require("joi"));
const auth_1 = require("middleware/auth");
const validators_1 = __importStar(require("validators"));
const router = express_1.default.Router();
const userSignUpValidation = (req, res, next) => {
    const querySchema = joi_1.default.object({
        name: joi_1.default.string().min(3).max(30).required().messages({
            'string.base': `"name" should be a type of 'text'`,
            'string.empty': `"name" cannot be an empty field`,
            'string.min': `"name" should have a minimum length of {#limit}`,
            'string.max': `"name" should have a maximum length of {#limit}`,
            'any.required': `"name" is a required field`,
        }),
        email: joi_1.default.string().email().required().messages({
            'string.email': `"email" must be a valid email`,
            'any.required': `"email" is a required field`,
        }),
        password: joi_1.default.string().min(6).max(30).required().messages({
            'string.base': `"password" should be a type of 'text'`,
            'string.empty': `"password" cannot be an empty field`,
            'string.min': `"password" should have a minimum length of {#limit}`,
            'string.max': `"password" should have a maximum length of {#limit}`,
            'any.required': `"password" is a required field`,
        }),
    });
    (0, validators_1.default)(req, res, next, [{ schema: querySchema, reqTarget: validators_1.reqTargetTypes.BODY }]);
};
const userLoginValidation = (req, res, next) => {
    const querySchema = joi_1.default.object({
        email: joi_1.default.string().email().required().messages({
            'string.email': `"email" must be a valid email`,
            'any.required': `"email" is a required field`,
        }),
        password: joi_1.default.string().min(6).max(30).required().messages({
            'string.base': `"password" should be a type of 'text'`,
            'string.empty': `"password" cannot be an empty field`,
            'string.min': `"password" should have a minimum length of {#limit}`,
            'string.max': `"password" should have a maximum length of {#limit}`,
            'any.required': `"password" is a required field`,
        }),
    });
    (0, validators_1.default)(req, res, next, [{ schema: querySchema, reqTarget: validators_1.reqTargetTypes.BODY }]);
};
router.post('/v1/users/', userSignUpValidation, (req, res, next) => {
    (0, user_1.signUpUser)(req, res, next).catch((err) => {
        return (0, error_1.logApiError)(req, res, next, err, 500, 'Could not create user');
    });
});
router.post('/v1/users/login', userLoginValidation, (req, res, next) => {
    (0, user_1.loginUser)(req, res, next).catch((err) => {
        return (0, error_1.logApiError)(req, res, next, err, 500, 'Could not login user');
    });
});
router.get('/v1/users/myProfile', auth_1.authenticateToken, (req, res, next) => {
    (0, user_1.getMyProfile)(req, res, next).catch((err) => {
        return (0, error_1.logApiError)(req, res, next, err, 500, 'Failed to get user profile');
    });
});
router.get('/v1/users/logout', auth_1.authenticateToken, (req, res, next) => {
    (0, user_1.logOut)(req, res, next).catch((err) => {
        return (0, error_1.logApiError)(req, res, next, err, 500, 'Could not log out user');
    });
});
router.get('/v1/users/recent-searches', auth_1.authenticateToken, (req, res, next) => {
    (0, user_1.userRecentSearches)(req, res, next).catch((err) => {
        return (0, error_1.logApiError)(req, res, next, err, 500, 'Failed to get user recent searches');
    });
});
exports.default = router;
//# sourceMappingURL=user.js.map