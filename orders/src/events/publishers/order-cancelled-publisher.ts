import { Publisher, OrderCancelleddEvent, Subjects } from "@yrtickets/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelleddEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
}
