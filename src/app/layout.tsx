import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import "react-toastify/dist/ReactToastify.css";
import LayoutWithHeader from "@/components/LayoutWithHeader";
import ToastProvider from "@/components/ToastProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { HeaderRefreshProvider } from "@/contexts/HeaderRefreshContext";
import { ModalProvider } from "@/contexts/ModalContext";

const pretendard = localFont({
  src: "../assets/fonts/PretendardVariable.woff2",
  variable: "--font-pretendard",
  weight: "100 900",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://marin-snack.store"),
  title: {
    default: "Snack - 기업용 간식 마켓플레이스",
    template: "%s | Snack",
  },
  description:
    "기업 담당자가 사내 간식 및 음료를 관리하고 주문할 수 있는 마켓플레이스",
  openGraph: {
    title: "Snack - 기업용 간식 마켓플레이스",
    description:
      "기업 담당자가 사내 간식 및 음료를 관리하고 주문할 수 있는 마켓플레이스",
    url: "https://marin-snack.store",
    siteName: "Snack",
    type: "website",
    locale: "ko_KR",
    images: [
      {
        url: "/landingpageall.png",
        width: 1600,
        height: 900,
        alt: "Snack 기업용 간식 마켓플레이스",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Snack - 기업용 간식 마켓플레이스",
    description:
      "기업 담당자가 사내 간식 및 음료를 관리하고 주문할 수 있는 마켓플레이스",
  },
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
        <ToastProvider />
      </body>
    </html>
  );
}
