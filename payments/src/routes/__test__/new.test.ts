import request from "supertest";
import mongoose from "mongoose";

import { app } from "../../app";
import { Order, OrderStatus } from "../../models/orders";
import { stripe } from "../../stripe";
import { Payment } from "../../models/payments";

jest.mock("../../stripe");

const orderId = mongoose.Types.ObjectId().toHexString();

it("throws a 401 if the user is not authenticated", async () => {
  await request(app)
    .post("/api/payments")
    .send({
      token: "asdf",
      orderId,
    })
    .expect(401);
});

it("throws a 404 error if the order does not exist", async () => {
  await request(app)
    .post("/api/payments")
    .set("Cookie", global.signin())
    .send({
      token: "asdf",
      orderId,
    })
    .expect(404);
});

it("throws a 401 if a user tries to pay for another user's order", async () => {
  const order = Order.build({
    id: orderId,
    version: 0,
    userId: mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    price: 20,
  });
  await order.save();

  await request(app)
    .post("/api/payments")
    .set("Cookie", global.signin())
    .send({
      token: "asdf",
      orderId: order.id,
    })
    .expect(401);
});

it("returns 400 when purchasing a cancelled order", async () => {
  const userId = mongoose.Types.ObjectId().toHexString();

  const order = Order.build({
    id: orderId,
    version: 0,
    userId,
    status: OrderStatus.Cancelled,
    price: 20,
  });
  await order.save();

  await request(app)
    .post("/api/payments")
    .set("Cookie", global.signin(userId))
    .send({
      token: "asdf",
      orderId: order.id,
    })
    .expect(400);
});

it("returns a 204 with valid inputs", async () => {
  const userId = mongoose.Types.ObjectId().toHexString();

  const order = Order.build({
    id: orderId,
    version: 0,
    userId,
    status: OrderStatus.Created,
    price: 20,
  });
  await order.save();

  await request(app)
    .post("/api/payments")
    .set("Cookie", global.signin(userId))
    .send({
      token: "tok_visa",
      orderId: order.id,
    })
    .expect(201);

  const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0];

  expect(chargeOptions.source).toEqual("tok_visa");
  expect(chargeOptions.amount).toEqual(order.price * 100);
  expect(chargeOptions.currency).toEqual("usd");

  const payment = await Payment.findOne({ orderId });

  expect(stripe.charges.create).toHaveBeenCalled();
  expect(payment).not.toBeNull();
});
