import { Publisher, OrderCreatedEvent, Subjects } from "@yrtickets/common";

export class OrderCreatedEvent extends Publisher<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
}
