import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { getSceneItems } from "@/data/portfolioItems";
import { SceneWrapper } from "@/components/SceneWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Lilli Portfolio",
  description: "Interactive 3D Portfolio",
};

export default async function RootLayout({ children }) {
  const sceneItems = await getSceneItems();

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SceneWrapper sceneItems={sceneItems} />
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  );
}
