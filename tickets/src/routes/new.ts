import express, { Request, Response } from "express";
import { body } from "express-validator";
import { requireAuth, validateRequest } from "@yrtickets/common";

import { Ticket } from "../models/ticket";
import { TicketCreatedPublisher } from "../events/publishers/ticket-created-publisher";

const router = express.Router();

router.post(
  "/api/tickets",
  requireAuth,
  [
    body("title").not().isEmpty().withMessage("Title is required"),
    body("price").isFloat({ gt: 0 }).withMessage("Price must be greater than 0"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { title, price } = req.body;

    const ticket = Ticket.build({
      title,
      price,
      userId: req.currentUser!.id,
    });
    await ticket.save();

    // Send data to Nats so that other services can recieve it as an event
    await new TicketCreatedPublisher(client).publish({
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      userId: req.currentUser!.id,
    });

    res.status(201).send(ticket);
  }
);

export { router as createTicketRouter };
