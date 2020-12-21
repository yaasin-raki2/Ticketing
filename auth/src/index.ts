import express from "express";
import "express-async-errors";
import { json } from "body-parser";

import { currentUserRoouter } from "./routes/current-user";
import { signoutRouter } from "./routes/signout";
import { signupRouter } from "./routes/signup";
import { signinRouter } from "./routes/signin";
import { errorHandler } from "./middlewares/error-handler";
import { NotFoundError } from "./errors/not-found-error";

const app = express();
app.use(json());

app.use(currentUserRoouter);
app.use(signoutRouter);
app.use(signupRouter);
app.use(signinRouter);

app.get("*", async () => {
  throw new NotFoundError();
});

app.use(errorHandler);

app.listen(3000, () => {
  console.log("Listening on port 3000!");
});
