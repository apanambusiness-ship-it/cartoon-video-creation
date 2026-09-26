import "./globals.css";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "ToonSutra AI", description: "AI story studio for Indian creators" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="hi"><body>{children}</body></html>; }
