import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Snack",
  description: "Snack",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-[#FDF0DF] font-['Pretendard']">
        {children}
      </body>
    </html>
  );
}
