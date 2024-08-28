import { logApiError } from "controllers/error";
import {
  getCompanyGuidancePeriods,
  getCompanyGuidanceTranscripts,
  getGuidanceCompanies,
  getTickerGuidance,
  getGuidanceRevisions,
} from "controllers/guidance";
import express from "express";
import Joi from "joi";
import { authenticateToken } from "middleware/auth";
import validateFn, { reqTargetTypes } from "validators";

const router = express.Router();

const tickerGuidanceValidation = (req, res, next) => {
  const querySchema = Joi.object({
    companyTicker: Joi.string(),
    fiscalYear: Joi.number(),
    fiscalQuarter: Joi.number(),
    metricType: Joi.string(),
    limit: Joi.number().min(0).default(400),
    skip: Joi.number().min(0).default(0),
  });

  validateFn(req, res, next, [
    { schema: querySchema, reqTarget: reqTargetTypes.QUERY },
  ]);
};

router.get(
  "/v1/guidance",
  authenticateToken,
  tickerGuidanceValidation,
  (req, res, next) =>
    getTickerGuidance(req, res, next).catch((err) => {
      return logApiError(
        req,
        res,
        next,
        err,
        500,
        "Could not get company guidance or it does not exist",
      );
    }),
);

const guidancePeriodsValidation = (req, res, next) => {
  const paramSchema = Joi.object({
    companyTicker: Joi.string().required(),
  });
  const querySchema = Joi.object({
    limit: Joi.number().min(0).default(400),
    skip: Joi.number().min(0).default(0),
  });

  validateFn(req, res, next, [
    { schema: querySchema, reqTarget: reqTargetTypes.QUERY },
    { schema: paramSchema, reqTarget: reqTargetTypes.PARAMS },
  ]);
};

router.get(
  "/v1/guidance/periods/:companyTicker",
  authenticateToken,
  guidancePeriodsValidation,
  (req, res, next) =>
    getCompanyGuidancePeriods(req, res, next).catch((err) => {
      return logApiError(
        req,
        res,
        next,
        err,
        500,
        "Could not get company guidance segments or they do not exist",
      );
    }),
);

const guidanceTranscriptsValidation = (req, res, next) => {
  const paramSchema = Joi.object({
    companyTicker: Joi.string().required(),
  });
  const querySchema = Joi.object({
    limit: Joi.number().min(0).default(400),
    skip: Joi.number().min(0).default(0),
  });

  validateFn(req, res, next, [
    { schema: querySchema, reqTarget: reqTargetTypes.QUERY },
    { schema: paramSchema, reqTarget: reqTargetTypes.PARAMS },
  ]);
};

router.get(
  "/v1/guidance/transcripts/:companyTicker",
  authenticateToken,
  guidanceTranscriptsValidation,
  (req, res, next) =>
    getCompanyGuidanceTranscripts(req, res, next).catch((err) => {
      return logApiError(
        req,
        res,
        next,
        err,
        500,
        "Could not get company guidance transcript segments or they do not exist",
      );
    }),
);

const guidanceCompaniesValidation = (req, res, next) => {
  const schema = Joi.object({
    limit: Joi.number().min(0).default(500),
    skip: Joi.number().min(0).default(0),
  });

  validateFn(req, res, next, [
    { schema: schema, reqTarget: reqTargetTypes.QUERY },
  ]);
};

router.get(
  "/v1/guidance/companies",
  authenticateToken,
  guidanceCompaniesValidation,
  (req, res, next) => {
    getGuidanceCompanies(req, res, next).catch((err) => {
      return logApiError(
        req,
        res,
        next,
        err,
        500,
        "Could not get guidance for companies",
      );
    });
  },
);

const guidanceRevisionValidation = (req, res, next) => {
  const schema = Joi.object({
    companyTicker: Joi.string(),
    fiscalYear: Joi.number(),
    metricType: Joi.string(),
  });

  validateFn(req, res, next, [
    { schema: schema, reqTarget: reqTargetTypes.QUERY },
  ]);
};

router.get(
  "/v1/guidance/revisions",
  authenticateToken,
  guidanceRevisionValidation,
  (req, res, next) => {
    getGuidanceRevisions(req, res, next).catch((err) => {
      return logApiError(
        req,
        res,
        next,
        err,
        500,
        "Could not get guidance revision for companies",
      );
    });
  },
);

export default router;
