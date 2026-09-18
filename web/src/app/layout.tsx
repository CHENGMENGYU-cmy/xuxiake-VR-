import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "徐霞客系统 - 第一视角旅行分享平台",
  description: "第一视角看世界，记录每一段旅程。分享瞬间捕获、全景影像、语音记录和旅行见闻。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider>{children}</ThemeProvider>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
