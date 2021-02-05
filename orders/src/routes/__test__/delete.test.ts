import request from "supertest";
import mongoose from "mongoose";

import { app } from "../../app";
import { Ticket } from "../../models/ticket";
import { OrderStatus } from "../../models/orders";
import { natsWrapper } from "../../nats-wrapper";

it("returns 400 if provided invalid id", async () => {
  await request(app)
    .delete("/api/orders/54dysfgstyfdf1sdy4")
    .set("Cookie", global.signin())
    .expect(400);
});

it("returns 404 if provided a valid id for a non existing order", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();

  await request(app)
    .delete(`/api/orders/${id}`)
    .set("Cookie", global.signin())
    .send()
    .expect(404);
});

it("returns 401 if a user tries to delete another user's order", async () => {
  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: "title",
    price: 20,
  });
  await ticket.save();

  const { body: order } = await request(app)
    .post("/api/orders")
    .set("Cookie", global.signin())
    .send({
      ticketId: ticket.id,
    })
    .expect(201);

  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set("Cookie", global.signin())
    .send()
    .expect(401);
});

it("Marks an order as cancelled", async () => {
  // Create a ticket with Ticket Model
  const user = global.signin();

  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: "title",
    price: 20,
  });
  await ticket.save();

  // Make a request to create an order
  const { body: order } = await request(app)
    .post("/api/orders")
    .set("Cookie", user)
    .send({
      ticketId: ticket.id,
    })
    .expect(201);

  // Make a request to cancell an order
  const response = await request(app)
    .delete(`/api/orders/${order.id}`)
    .set("Cookie", user)
    .send()
    .expect(200);

  // Expectation to make sure the thing is cancelled
  expect(response.body.status).toEqual(OrderStatus.Cancelled);
});

it("Emits an order cancelled event", async () => {
  const user = global.signin();

  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: "title",
    price: 20,
  });
  await ticket.save();

  const { body: order } = await request(app)
    .post("/api/orders")
    .set("Cookie", user)
    .send({
      ticketId: ticket.id,
    })
    .expect(201);

  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set("Cookie", user)
    .send()
    .expect(200);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
