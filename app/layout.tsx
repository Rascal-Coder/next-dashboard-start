// For adding custom fonts with other frameworks, see:
// https://tailwindcss.com/docs/font-family
import type { Metadata } from "next";
import "#/globals.css";
import { inter } from "@/lib/fonts";
import { Providers } from "./Providers";

export const metadata: Metadata = {
  title: "Xpress dashboard",
  description: "Xpress dashboard by Rascal Coder , build with Next.js and shadcn/ui and Tailwind CSS starter template",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} antialiased`}
      suppressHydrationWarning
    >
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
