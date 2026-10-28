import type { Metadata } from "next";
import { Geist, Geist_Mono, Cairo, Tajawal } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import DynamicLogo from "@/components/layout/logo/DynamicLogo";
import Footer from "@/components/layout/footer";
import FloatingDock from "@/components/common/FloatingDock";
import CustomCursor from "@/components/ui/CustomCursor";
import I18nProvider from "@/components/I18nProvider";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// خطوط عربية متاحة في قائمة الخط داخل المحرر. القيمة المخزنة في المحتوى: var(--font-cairo) / var(--font-tajawal)
const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  display: "swap",
});

const tajawal = Tajawal({
  variable: "--font-tajawal",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Design Gallery | معرض التصميم",
  description:
    "استوديو إبداعي متخصص في تحويل الرؤى الطموحة إلى تجارب رقمية استثنائية. A creative studio specialized in transforming ambitious visions into exceptional digital experiences.",
};

// يضبط lang/dir قبل أول رسم للصفحة (يمنع وميض الاتجاه عند اختيار العربية سابقاً).
// نص ثابت لا يحتوي أي مدخلات خارجية.
const LANG_INIT_SCRIPT = `try{var l=localStorage.getItem("lang");if(l==="ar"){var d=document.documentElement;d.lang="ar";d.dir="rtl"}}catch(e){}`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: LANG_INIT_SCRIPT }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${cairo.variable} ${tajawal.variable} relative antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <I18nProvider>
            <ErrorBoundary>
              <DynamicLogo />
              <FloatingDock />
              <main className="min-h-screen flex-col items-center justify-between bg-white text-black dark:bg-gray-900 dark:text-white relative">
                {children}
              </main>
              <CustomCursor />
              <Footer />
              <Toaster />
            </ErrorBoundary>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
