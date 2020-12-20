import express from "express";
import { json } from "body-parser";

import { currentUserRoouter } from "./routes/current-user";
import { signoutRouter } from "./routes/signout";
import { signupRouter } from "./routes/signup";
import { signinRouter } from "./routes/signin";

const app = express();
app.use(json());

app.use(currentUserRoouter);
app.use(signoutRouter);
app.use(signupRouter);
app.use(signinRouter);

app.listen(3000, () => {
  console.log("Listening on port 3000!");
});
