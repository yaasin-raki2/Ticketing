import express, { Request, Response } from "express";
import mongoose from "mongoose";
import { body } from "express-validator";
import { requireAuth, validateRequest } from "@yrtickets/common";

const router = express.Router();

router.post(
  "/api/orders",
  requireAuth,
  [
    body("ticketId")
      .not()
      .isEmpty()
      .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
      .withMessage("TicketId must be provided"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { ticketId } = req.body;
    res.send();
  }
);

export { router as newOrderRouter };