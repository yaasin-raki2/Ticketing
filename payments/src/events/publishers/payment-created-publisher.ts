import { Subjects, Publisher, PaymenTcreatedEvent } from "@yrtickets/common";

export class PaymentCreatedPublisher extends Publisher<PaymenTcreatedEvent> {
  subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
}
