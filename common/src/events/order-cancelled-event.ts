import { Subjects } from "./subjects";

export interface OrderCancelleddEvent {
  subject: Subjects.OrderCreated;
  data: {
    id: string;
    version: number;
    ticket: {
      id: string;
    };
  };
}
