import { Message } from "node-nats-streaming";
import { Listener, Subjects, PaymenTcreatedEvent } from "@yrtickets/common";

import { queueGroupName } from "./queue-group-name";
import { Order, OrderStatus } from "../../models/orders";

export class PaymentCreateListener extends Listener<PaymenTcreatedEvent> {
  subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: PaymenTcreatedEvent["data"], msg: Message) {
    const order = await Order.findById(data.orderId);

    if (!order) {
      throw new Error("Order not found");
    }

    order.set({
      status: OrderStatus.Complete,
    });
    await order.save();

    msg.ack();
  }
}
