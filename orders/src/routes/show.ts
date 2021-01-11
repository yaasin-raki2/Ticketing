import express, { Request, Response } from "express";
import { param } from "express-validator";
import mongoose from "mongoose";
import {
  NotAuthorizedError,
  NotFoundError,
  requireAuth,
  validateRequest,
} from "@yrtickets/common";

import { Order } from "../models/orders";

const router = express.Router();

router.get(
  "/api/orders/:id",
  requireAuth,
  [
    param("id")
      .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
      .withMessage("orderId must be valid"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    // fetch an order of a specific User send it back
    const order = await Order.findById(req.params.id).populate("ticket");

    if (!order) {
      throw new NotFoundError();
    }

    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    res.send(order);
  }
);

export { router as showOrderRouter };
