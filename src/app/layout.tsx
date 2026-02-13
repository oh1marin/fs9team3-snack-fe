import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import "react-toastify/dist/ReactToastify.css";
import LayoutWithHeader from "@/components/LayoutWithHeader";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { HeaderRefreshProvider } from "@/contexts/HeaderRefreshContext";
import { ModalProvider } from "@/contexts/ModalContext";
import { ToastContainer } from "react-toastify";

const pretendard = localFont({
  src: "../assets/fonts/PretendardVariable.woff2",
  variable: "--font-pretendard",
  weight: "100 900",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Snack",
  description: "포토카드 마켓플레이스",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className={pretendard.variable}>
      <body className={pretendard.className}>
        <AuthProvider>
          <HeaderRefreshProvider>
            <CartProvider>
              <ModalProvider>
                <LayoutWithHeader>
                  {children}
                </LayoutWithHeader>
              </ModalProvider>
            </CartProvider>
          </HeaderRefreshProvider>
        </AuthProvider>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </body>
    </html>
  );
}
