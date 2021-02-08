import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { TicketCreatedEvent } from "@yrtickets/common";

import { TicketCreatedListener } from "../ticket-created-listener";
import { natsWrapper } from "../../../nats-wrapper";
import { Ticket } from "../../../models/ticket";

const setup = async () => {
  //Create an instance of the listener
  const listener = new TicketCreatedListener(natsWrapper.client);

  //Create a fake data event
  const data: TicketCreatedEvent["data"] = {
    version: 0,
    id: mongoose.Types.ObjectId().toHexString(),
    title: "concert",
    price: 10,
    userId: mongoose.Types.ObjectId().toHexString(),
  };

  //Fake message object
  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg };
};

it("creates and saves a ticket", async () => {
  const { listener, data, msg } = await setup();

  //Call the on message function with the data object + message object
  await listener.onMessage(data, msg);

  //Write assertions to make sure a ticket was created!
  const ticket = await Ticket.findById(data.id);

  expect(ticket).toBeDefined();
  expect(ticket!.title).toEqual(data.title);
  expect(ticket!.price).toEqual(data.price);
});

it("acks the message", async () => {
  const { listener, data, msg } = await setup();

  //Call the on message function with the data object + message object
  await listener.onMessage(data, msg);

  //Write assertions to make sure ack function is called!
  expect(msg.ack).toHaveBeenCalled();
});
