import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tactical Pulse v1.0 | Pitchside Analytics",
  description: "Real-time fatigue simulation and tactical intelligence dashboard for Portland Hearts of Pine — USL League One.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
