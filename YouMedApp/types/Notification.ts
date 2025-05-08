import User from "./User";

export default interface Notifications {
  notificationID: number;
  title: string;
  message: string;
  status: string;
  user: User;
  createdAt: string;
}