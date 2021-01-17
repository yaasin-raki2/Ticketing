import { Publisher, OrderCreatedEvent, Subjects } from "@yrtickets/common";

export class OrderCreatePublisher extends Publisher<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
}
