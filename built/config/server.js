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
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectToDB = void 0;
const envVariables_1 = require("config/envVariables");
const mongoose_1 = require("mongoose");
const mongoURI = (0, envVariables_1.makeMongoURI)('transcripts');
const connectToDB = () => __awaiter(void 0, void 0, void 0, function* () {
    (0, mongoose_1.connect)(mongoURI).catch((err) => {
        console.error('Error connecting to Mongo DB server\n');
        console.error(err.message);
    });
    // set('debug', true)
    console.log(`Connected To  Mongo DB Server at address ${mongoURI}\n`);
});
exports.connectToDB = connectToDB;
//# sourceMappingURL=server.js.map