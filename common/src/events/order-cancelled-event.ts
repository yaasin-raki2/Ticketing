import { Subjects } from "./subjects";

export interface OrderCancelleddEvent {
  subject: Subjects.OrderCreated;
  data: {
    id: string;
    ticket: {
      id: string;
    };
  };
}
