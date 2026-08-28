import { MessagesLayoutClient } from "./MessagesLayoutClient";

export const metadata = {
  title: "Messages — Corn Mart",
};

export default function MessagesLayout({ children }) {
  return <MessagesLayoutClient>{children}</MessagesLayoutClient>;
}