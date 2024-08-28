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
const dotenv = __importStar(require("dotenv"));
dotenv.config({ path: `${process.cwd()}/.env` });
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const envVariables_1 = require("./config/envVariables");
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const server_1 = require("./config/server");
const error_1 = require("./controllers/error");
const guidance_1 = __importDefault(require("./routes/guidance"));
// import processTranscriptRoutes from './routes/processTranscripts'
const transcripts_1 = __importDefault(require("./routes/transcripts"));
const user_1 = __importDefault(require("./routes/user"));
const scheduledJobs_1 = require("./scheduledJobs");
// activate morgan logging
app.use((0, morgan_1.default)("dev"));
// establish DB connection
(0, server_1.connectToDB)().then(() => __awaiter(void 0, void 0, void 0, function* () {
    // dev stuff here
}));
// set whitelist - might be temporary before other security measures are established
let whiteList = [
    /^https:\/\/sequent-fin\.netlify\.app$/,
    /sequent-fin\.netlify\.app/,
    /^https:\/\/admirable-paprenjak-66e11d\.netlify\.app$/,
    /^https:\/\/guidance-frontend\.vercel\.app$/,
];
// allow local front ends into the server
if (envVariables_1.nodeEnv === "local") {
    whiteList = whiteList.concat([
        /^http:\/\/localhost:300.$/,
        /^http:\/\/localhost:1234$/,
        /^http:\/\/localhost:5173$/,
    ]);
}
const corsOptions = {
    origin: (origin, callback) => {
        if (!origin) {
            callback(null, true);
            return;
        }
        let found = false;
        for (const reg of whiteList) {
            if (reg.test(origin)) {
                found = true;
                break;
            }
        }
        if (found) {
            callback(null, true);
        }
        else {
            callback(new Error(`Hey So This Isn't Allowed by CORS`));
        }
    },
    credentials: true,
};
app.use((0, cors_1.default)(corsOptions));
// route parsing middleware
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// application routes
app.use("/api", guidance_1.default);
app.use("/api", transcripts_1.default);
// app.use('/api', processTranscriptRoutes)
app.use("/api", user_1.default);
app.use("*", error_1.genericExpressErrorHandler);
//run scheduled jobs
if (envVariables_1.nodeEnv !== "local")
    (0, scheduledJobs_1.runSampleJob)();
app.listen(envVariables_1.port, () => {
    console.log(`A ${envVariables_1.nodeEnv ? envVariables_1.nodeEnv.toUpperCase() : "NO ENV FILE"} Node JS Server is listening on port ${envVariables_1.port}`);
});
//# sourceMappingURL=index.js.map