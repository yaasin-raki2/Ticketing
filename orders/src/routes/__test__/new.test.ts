import request from "supertest";
import mongoose from "mongoose";

import { app } from "../../app";

import { Order, OrderStatus } from "../../models/orders";
import { Ticket } from "../../models/ticket";

it("returns 401 if the user is not authenticated", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();

  await request(app)
    .post("/api/orders")
    .send({
      ticket: id,
    })
    .expect(401);
});

it("returns 400 on invalid ticketId", async () => {
  await request(app)
    .post("/api/orders")
    .set("Cookie", global.signin())
    .send({
      ticketId: "sd214fd43f",
    })
    .expect(400);

  await request(app)
    .post("/api/orders")
    .set("Cookie", global.signin())
    .send({
      ticketId: "",
    })
    .expect(400);

  await request(app)
    .post("/api/orders")
    .set("Cookie", global.signin())
    .send({})
    .expect(400);
});

it("returns an error if the ticket does not exist", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();

  await request(app)
    .post("/api/orders")
    .set("Cookie", global.signin())
    .send({
      ticketId: id,
    })
    .expect(404);
});

it("return an error if the ticket is already reserved", async () => {
  const ticket = Ticket.build({
    title: "title",
    price: 20,
  });
  await ticket.save();

  const order = Order.build({
    userId: "kjsdfsdkwyfg",
    status: OrderStatus.Created,
    expiresAt: new Date(),
    ticket,
  });
  await order.save();

  await request(app)
    .post("/api/orders")
    .set("Cookie", global.signin())
    .send({
      ticketId: ticket.id,
    })
    .expect(400);
});

it("reserves a ticket", async () => {
  const ticket = Ticket.build({
    title: "title",
    price: 20,
  });
  await ticket.save();

  await request(app)
    .post("/api/orders")
    .set("Cookie", global.signin())
    .send({
      ticketId: ticket.id,
    })
    .expect(201);
});