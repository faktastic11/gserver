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
exports.reqTargetTypes = void 0;
const error_1 = require("controllers/error");
var reqTargetTypes;
(function (reqTargetTypes) {
    reqTargetTypes["BODY"] = "body";
    reqTargetTypes["QUERY"] = "query";
    reqTargetTypes["PARAMS"] = "params";
})(reqTargetTypes || (exports.reqTargetTypes = reqTargetTypes = {}));
exports.default = (req, res, next, targets) => __awaiter(void 0, void 0, void 0, function* () {
    const options = {
        abortEarly: false, // include all errors
        allowUnknown: true, // ignore unknown props
        stripUnknown: true, // remove unknown props
    };
    for (const { schema, reqTarget } of targets) {
        const { error, value } = schema.validate(req[reqTarget], options);
        if (error) {
            return (0, error_1.logApiError)(req, res, next, Error('Validation Error'), 400, error.details);
        }
        else {
            req[reqTarget] = value;
        }
    }
    next();
});
//# sourceMappingURL=index.js.map