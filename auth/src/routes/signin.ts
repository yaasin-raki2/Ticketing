import express, { Request, Response } from "express";
import { body, validationResult } from "express-validator";

import { validateRequest } from "../middlewares/validate-request";

const router = express.Router();

router.post(
  "/api/users/signin",
  [
    body("email").isEmail().withMessage("Email must e valid"),
    body("password").trim().notEmpty().withMessage("You must supply a password"),
  ],
  validateRequest,
  (req: Request, res: Response) => {}
);

export { router as signinRouter };
