import { Viewport } from "next";
import { Client } from "./client";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function Home() {
  return <Client />;
}
