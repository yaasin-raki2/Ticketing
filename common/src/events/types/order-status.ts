export enum OrderStatus {
  // When the order was created, but the
  // ticket it is trying to order has not been reserved
  Created = "created",

  // The ticket the order is trying to reserve has already
  // been reserved, or when the user cancelled the order.
  // Or the order expired befor payment
  Cancelled = "cancelled",

  // The order has successfully reserved the ticket
  AwaitingPayement = "awaiting:payment",

  // The  order has the ticket and the user has
  // provided payment successfully
  Complete = "complete",
}
