import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { TicketUpdatedEvent } from "@yrtickets/common";

import { TicketUpdatedListener } from "../ticket-updated-listener";
import { natsWrapper } from "../../../nats-wrapper";
import { Ticket } from "../../../models/ticket";

const setup = async () => {
  //Create an instance of the listener
  const listener = new TicketUpdatedListener(natsWrapper.client);

  //Creates a ticket
  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: "movie",
    price: 20,
  });
  await ticket.save();

  //Create a fake data event
  const data: TicketUpdatedEvent["data"] = {
    version: ticket.version + 1,
    id: ticket.id,
    title: "concert",
    price: 10,
    userId: mongoose.Types.ObjectId().toHexString(),
  };

  //Fake message object
  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  //return all of this stuff
  return { listener, data, msg, ticket };
};

it("finds, updates and saves a ticket", async () => {
  const { listener, data, msg, ticket } = await setup();

  //Call the on message function with the data object + message object
  await listener.onMessage(data, msg);

  //Write assertions to make sure a ticket was Updated!
  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket!.version).toEqual(data.version);
  expect(updatedTicket!.title).toEqual(data.title);
  expect(updatedTicket!.price).toEqual(data.price);
});

it("acks the message", async () => {
  const { listener, data, msg } = await setup();

  //Call the on message function with the data object + message object
  await listener.onMessage(data, msg);

  //Write assertions to make sure ack function is called!
  expect(msg.ack).toHaveBeenCalled();
});

it("does not call ack if the event has a skipped version", async () => {
  const { msg, data, listener } = await setup();

  data.version = 10;

  try {
    await listener.onMessage(data, msg);
  } catch (err) {}

  expect(msg.ack).not.toHaveBeenCalled();
});
