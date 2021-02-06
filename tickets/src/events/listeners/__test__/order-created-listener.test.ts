import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { OrderCreatedEvent, OrderStatus } from "@yrtickets/common";

import { Ticket } from "../../../models/ticket";
import { natsWrapper } from "../../../nats-wrapper";
import { OrderCreatedListener } from "../order-created-listener";

const setup = async () => {
  //Create a mock ticket
  const ticket = Ticket.build({
    title: "concert",
    price: 234,
    userId: "abc",
  });
  await ticket.save();

  //Create a mock listener
  const listener = new OrderCreatedListener(natsWrapper.client);

  //Create a mock data
  const data: OrderCreatedEvent["data"] = {
    id: mongoose.Types.ObjectId().toHexString(),
    version: ticket.version,
    status: OrderStatus.Created,
    userId: "abc",
    expiresAt: Date(),
    ticket: {
      id: ticket.id,
      price: ticket.price,
    },
  };

  //Create a mock message
  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  //return all this stuff
  return { listener, data, msg, ticket };
};

it("sets the orderId to the ticket", async () => {
  const { listener, data, msg, ticket } = await setup();

  await listener.onMessage(data, msg);

  const ticketWithOrderId = await Ticket.findById(ticket.id);

  expect(ticketWithOrderId.orderId).toEqual(data.id);
});

it("acknowledge the message", async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});

it("publishes a ticket updated event", async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled();

  const ticketUpdatedData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  );

  expect(ticketUpdatedData.orderId).toEqual(data.id);
});
