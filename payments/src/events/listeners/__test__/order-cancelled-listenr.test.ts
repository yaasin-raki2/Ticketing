import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { OrderCancelleddEvent, OrderStatus } from "@yrtickets/common";

import { natsWrapper } from "../../../nats-wrapper";
import { OrderCancelledListener } from "../order-cancelled-listener";
import { Order } from "../../../models/orders";

const setup = async () => {
  const listener = new OrderCancelledListener(natsWrapper.client);

  const order = Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    version: 0,
    userId: "asdf",
    status: OrderStatus.Created,
    price: 20,
  });
  await order.save();

  const data: OrderCancelleddEvent["data"] = {
    id: order.id,
    version: 1,
    ticket: {
      id: "ksdy",
    },
  };

  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, order, data, msg };
};

it("marks the order's status as cancelled", async () => {
  const { listener, data, order, msg } = await setup();

  await listener.onMessage(data, msg);

  const updatedOrder = await Order.findById(order.id);

  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it("acks the message", async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
