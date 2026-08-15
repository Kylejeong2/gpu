import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "H100 / GPU Glossary",
  description: "An interactive 3D guide to NVIDIA H100 GPU architecture.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
