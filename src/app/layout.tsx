import Providers from "@/components/Provider";
import type { Metadata } from "next";
import "@/app/styles/_app.scss";
import { ToastContainer } from "react-toastify";

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
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={true}
          newestOnTop={false}
          theme="light"
          closeOnClick
          pauseOnHover
          draggable
          limit={3}
          style={{
            width: 'auto',
            maxWidth: '500px',
          }}
        />
      </body>
    </html>
  );
}
