import Providers from "@/components/Provider";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Knull",
  description: "Medical test cases generator",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
