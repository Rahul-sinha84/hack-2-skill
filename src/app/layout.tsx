import "@/utils/promisePolyfill"; // Import polyfill first
import Providers from "@/components/Provider";
import GlobalErrorBoundary from "@/components/GlobalErrorBoundary";
import type { Metadata } from "next";
import "@/app/styles/_app.scss";
import { ToastContainer } from "react-toastify";

export const metadata: Metadata = {
  title: "TestAI",
  description: "Medical test cases generator",
  icons: {
    icon: [
      { url: "/ai-logo.png", sizes: "32x32", type: "image/png" },
      { url: "/ai-logo.png", sizes: "16x16", type: "image/png" },
    ],
    shortcut: "/ai-logo.png",
    apple: "/ai-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <GlobalErrorBoundary>
          <Providers>{children}</Providers>
        </GlobalErrorBoundary>
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
            width: "auto",
            maxWidth: "500px",
          }}
        />
      </body>
    </html>
  );
}
