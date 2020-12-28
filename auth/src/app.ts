import express from "express";
import "express-async-errors";
import { json } from "body-parser";
import cookieSession from "cookie-session";

import { currentUserRoouter } from "./routes/current-user";
import { signoutRouter } from "./routes/signout";
import { signupRouter } from "./routes/signup";
import { signinRouter } from "./routes/signin";
import { errorHandler } from "./middlewares/error-handler";
import { NotFoundError } from "./errors/not-found-error";

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

app.use(currentUserRoouter);
app.use(signoutRouter);
app.use(signupRouter);
app.use(signinRouter);

app.get("*", async () => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
