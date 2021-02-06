import { Message } from "node-nats-streaming";
import { Listener, Subjects, OrderCreatedEvent } from "@yrtickets/common";

import { queueGroupName } from "./queue-group-name";
import { Ticket } from "../../models/ticket";
import { TicketUpdatedPublisher } from "../publishers/ticket-updated-publisher";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  queueGroupName = queueGroupName;
  async onMessage(data: OrderCreatedEvent["data"], msg: Message) {
    //Find the ticket that the order is reserving
    const ticket = await Ticket.findById(data.ticket.id);

    //If no ticket throw an error
    if (!ticket) {
      throw new Error("Ticket nt found");
    }

    //Mark the ticket as being reserved by setting the orderId property
    ticket.set({ orderId: data.id });

    //Save the ticket
    await ticket.save();

    //Publish an event to NATS
    await new TicketUpdatedPublisher(this.client).publish({
      id: ticket.id,
      version: ticket.version,
      title: ticket.title,
      price: ticket.prive,
      userId: ticket.userId,
      orderId: ticket.orderId,
    });

    //Acknowledge the message to NATS
    msg.ack();
  }
}
