import { logApiError } from "controllers/error";
import { getRawTranscripts } from "controllers/rawTranscripts";
import { getStagingTranscriptsByCompany } from "controllers/stagingTranscript";
import express from "express";
import Joi from "joi";
import validateFn, { reqTargetTypes } from "validators";

const router = express.Router();

const transcriptsValidation = (req, res, next) => {
  const querySchema = Joi.object({
    companyTicker: Joi.string(),
    transcriptYear: Joi.number(),
    transcriptQuarter: Joi.number(),
    limit: Joi.number().min(0).default(400),
    skip: Joi.number().min(0).default(0),
  });

  validateFn(req, res, next, [
    { schema: querySchema, reqTarget: reqTargetTypes.QUERY },
  ]);
};

router.get("/v1/raw/transcripts", transcriptsValidation, (req, res, next) =>
  getRawTranscripts(req, res, next).catch((err) => {
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

const stagingTranscriptsListValidation = (req, res, next) => {
  const querySchema = Joi.object({
    companyTicker: Joi.string(),
    outputToCSV: Joi.boolean().default(false),
  });

  validateFn(req, res, next, [
    { schema: querySchema, reqTarget: reqTargetTypes.QUERY },
  ]);
};

// router.get('/v1/staging/transcripts', stagingTranscriptsListValidation, (req, res, next) =>
//   getAllStagingTranscriptPeriods(req, res, next).catch((err) => {
//     return logApiError(req, res, next, err, 500, 'Could not get staging transcripts list')
//   }),
// )

const stagingTranscriptsValidation = (req, res, next) => {
  const querySchema = Joi.object({
    companyTicker: Joi.string(),
    outputToCSV: Joi.boolean().default(false),
  });

  validateFn(req, res, next, [
    { schema: querySchema, reqTarget: reqTargetTypes.QUERY },
  ]);
};

router.get(
  "/v1/staging/transcript",
  stagingTranscriptsValidation,
  (req, res, next) =>
    getStagingTranscriptsByCompany(req, res, next).catch((err) => {
      return logApiError(
        req,
        res,
        next,
        err,
        500,
        "Could not get company staging transcripts or they do not exist",
      );
    }),
);

export default router;
