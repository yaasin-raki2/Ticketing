import { useEffect, useState } from "react";
import StripeCheckout from "react-stripe-checkout";
import axios from "axios";
import Router from "next/router";

const OrderShow = ({ order, currentUser }) => {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const findTimeLeft = () => {
      const msLeft = new Date(order.expiresAt) - new Date();
      setTimeLeft(Math.round(msLeft / 1000));
    };

    findTimeLeft();
    const timerId = setInterval(findTimeLeft, 1000);

    return () => {
      clearInterval(timerId);
    };
  }, []);

  if (timeLeft < 0) {
    return (
      <div>
        <h1>Order Expired</h1>
      </div>
    );
  }

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft - minutes * 60;

  const onToken = async (token) => {
    try {
      await axios.post("/api/payments", {
        orderId: order.id,
        token: token.id,
      });
      Router.push("/orders");
    } catch (err) {
      alert(err);
    }
  };

  return (
    <div>
      <h1>Time left to pay: {`${minutes}min ${seconds}s`}</h1>
      <StripeCheckout
        token={onToken}
        stripeKey="pk_test_51HkqejJWM5w4kjULdrXsBKvBOYrTgc9RV7CxLO6KqeVD7VdW3u6y7FD2aGBzhhQY1QcV8iWbBH47t0Hkf93yqwxM00vaxkHxvG"
        amount={order.ticket.price * 100}
        email={currentUser.email}
      />
    </div>
  );
};

OrderShow.getInitialProps = async (context, client) => {
  const { orderId } = context.query;
  const { data } = await client.get(`/api/orders/${orderId}`);

  return { order: data };
};

export default OrderShow;
