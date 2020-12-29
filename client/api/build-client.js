import axios from "axios";

export default ({ req }) => {
  if (typeof window === "undefined") {
    // We are on the serveur
    return axios.create({
      baseURL: "http://ingress-nginx-controller.ingress-nginx.svc.cluster.local",
      headers: req.headers,
    });
  } else {
    // We must be in the Browser
    return axios.create({
      baseURL: "/",
    });
  }
};
