import { Message } from "node-nats-streaming";
import { OrderCancelleddEvent, Subjects, Listener, OrderStatus } from "@yrtickets/common";

import { queueGroupName } from "./queue-group-name";
import { Order } from "../../models/orders";

export class OrderCancelledListener extends Listener<OrderCancelleddEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCancelleddEvent["data"], msg: Message) {
    const order = await Order.findOne({
      _id: data.id,
      version: data.version - 1,
    });

    if (!order) {
      throw new Error("Order not found");
    }

    order.set({ status: OrderStatus.Cancelled });
    await order.save();

    msg.ack();
  }
}
