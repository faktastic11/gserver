"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRecentSearches = exports.logOut = exports.getMyProfile = exports.loginUser = exports.signUpUser = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const models_1 = require("../models");
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
const JWT_TOKEN_EXPIRATION = process.env.JWT_TOKEN_EXPIRATION;
const signUpUser = (req, res, _next) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password } = req.body;
    try {
        const userExists = yield models_1.User.findOne({
            email: req.body.email,
        }).exec();
        if (userExists) {
            return res.status(400).send({ error: 'User with this email already exists' });
        }
        const user = yield models_1.User.create({
            name,
            email,
            password,
        });
        if (!user) {
            return res.status(500).send({ error: 'Could not create user' });
        }
        return res.send({
            message: 'User signed up successfully.',
            user,
        });
    }
    catch (error) {
        console.error('SignUp error:', error);
        return res.status(500).send({ error: 'Internal server error' });
    }
});
exports.signUpUser = signUpUser;
const loginUser = (req, res, _next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const user = yield models_1.User.findOne({ email }).select('+password').exec();
        if (!user) {
            return res.status(404).send({ error: 'User not found' });
        }
        const isPasswordValid = yield bcrypt_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).send({ error: 'Invalid email or password' });
        }
        const token = jsonwebtoken_1.default.sign({ userId: user._id, email: user.email }, JWT_SECRET_KEY, { expiresIn: JWT_TOKEN_EXPIRATION });
        user.password = undefined;
        return res.send({
            message: 'User logged in successfully',
            token,
            user,
        });
    }
    catch (err) {
        console.error('Login error:', err);
        return res.status(500).send({ error: 'Internal server error' });
    }
});
exports.loginUser = loginUser;
const getMyProfile = (req, res, _next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.user;
    try {
        if (!userId) {
            return res.status(400).send({ error: 'User not found' });
        }
        const user = yield models_1.User.findById(userId).exec();
        return res.status(200).send({
            message: 'User profile fetched successfully',
            user,
        });
    }
    catch (err) {
        console.error('Login error:', err);
        return res.status(500).send({ error: 'Internal server error' });
    }
});
exports.getMyProfile = getMyProfile;
const logOut = (req, res, _next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return res.clearCookie('token').send({ message: 'Logged out successfully' });
    }
    catch (error) {
        console.error('Logout error:', error);
        return res.status(500).send({ error: 'Internal server error' });
    }
});
exports.logOut = logOut;
const userRecentSearches = (req, res, _next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.user;
        const userExists = yield models_1.User.findById(userId).exec();
        if (!userExists) {
            return res.status(400).send({ error: 'User not found' });
        }
        const userHistory = yield models_1.UserHistory.findOne({ userId }).exec();
        const { searches } = userHistory;
        const lastThreeSearches = searches.slice(-3);
        return res.status(200).send({
            message: 'User recent searches fetched successfully',
            searches: lastThreeSearches || [],
        });
        return res.send({ message: 'Protected resource fetched successfully' });
    }
    catch (error) {
        console.error('Protected resource error:', error);
        return res.status(500).send({ error: 'Internal server error' });
    }
});
exports.userRecentSearches = userRecentSearches;
//# sourceMappingURL=user.js.map