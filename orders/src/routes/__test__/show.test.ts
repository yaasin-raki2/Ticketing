import request from "supertest";
import mongoose from "mongoose";

import { app } from "../../app";
import { Ticket } from "../../models/ticket";

it("returns 400 if provided invalid id", async () => {
  await request(app)
    .get("/api/orders/54dysfgstyfdf1sdy4")
    .set("Cookie", global.signin())
    .expect(400);
});

it("returns 404 if provided a valid id for a non existing order", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();

  await request(app)
    .get(`/api/orders/${id}`)
    .set("Cookie", global.signin())
    .send()
    .expect(404);
});

it("returns 401 if a user tries to fetch another user's order", async () => {
  const ticket = Ticket.build({
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
    .get(`/api/orders/${order.id}`)
    .set("Cookie", global.signin())
    .send()
    .expect(401);
});

it("returns an order of a specific user when providing the order's id", async () => {
  const userId = global.signin();

  const ticket = Ticket.build({
    title: "title",
    price: 20,
  });
  await ticket.save();

  const { body: order } = await request(app)
    .post("/api/orders")
    .set("Cookie", userId)
    .send({
      ticketId: ticket.id,
    })
    .expect(201);

  const response = await request(app)
    .get(`/api/orders/${order.id}`)
    .set("Cookie", userId)
    .send()
    .expect(200);

  expect(response.body.id).toEqual(order.id);
});
