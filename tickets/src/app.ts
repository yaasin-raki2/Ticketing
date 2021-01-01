import express from "express";
import "express-async-errors";
import { json } from "body-parser";
import cookieSession from "cookie-session";
import { errorHandler, NotFoundError } from "@yrtickets/common";

const app = express();

app.set("trust proxy", true);

app.use(json());
app.use(
  cookieSession({
    signed: false,
    // jest and superTest use plain HTTP request
    // But the secure property in cookieSession when turned to true
    // Accepts only HTTPS requests
    // For this reason we gonna change the secure property to false
    // When we are in a test environment
    secure: process.env.NODE_ENV !== "test",
  })
);

app.all("*", async () => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
