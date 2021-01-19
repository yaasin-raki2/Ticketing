import express, { Request, Response } from "express";
import { param } from "express-validator";
import mongoose from "mongoose";
import {
  NotAuthorizedError,
  NotFoundError,
  requireAuth,
  validateRequest,
} from "@yrtickets/common";

import { Order, OrderStatus } from "../models/orders";
import { natsWrapper } from "../nats-wrapper";
import { OrderCancelledPublisher } from "../events/publishers/order-cancelled-publisher";

const router = express.Router();

router.delete(
  "/api/orders/:id",
  requireAuth,
  [
    param("id")
      .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
      .withMessage("orderId must be valid"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const order = await Order.findById(req.params.id).populate("ticket");

    if (!order) {
      throw new NotFoundError();
    }

    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    order.status = OrderStatus.Cancelled;
    await order.save();

    // Publishing an event saying this was cancelled
    new OrderCancelledPublisher(natsWrapper.client).publish({
      id: order.id,
      ticket: {
        id: order.ticket.id,
      },
    });

    res.send(order);
  }
);

export { router as deleteOrderRouter };
