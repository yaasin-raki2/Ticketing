import { Publisher, OrderCreatedEvent, Subjects } from "@yrtickets/common";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
}
