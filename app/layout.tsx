import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GPU Glossary",
  description: "Interactive 3D guides to NVIDIA H100, B200, GB300, and NVL72 hardware.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
