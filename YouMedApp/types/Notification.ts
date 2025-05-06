import { User } from "./User";

export interface Notifications {
  notificationID: number;
  title: string;
  message: string;
  status: string;
  user: User;
  createdAt: string;
}
