import { Lora, Poppins } from "next/font/google";
import "./globals.css";

const lora = Lora({ subsets: ["latin"], weight: ["400", "500", "600", "700"], style: ["normal", "italic"], variable: "--font-serif" });
const poppins = Poppins({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"], variable: "--font-sans" });

export const metadata = {
  title: "Check-in · Ultra Black Lucrativa",
  description: "Antes do dia 08, eu quero te conhecer melhor. Faça seu check-in pra Ultra Black Lucrativa.",
  openGraph: {
    title: "Check-in · Ultra Black Lucrativa",
    description: "08 de Outubro às 20h. Faça seu check-in.",
    images: ["/img/og.jpg"],
  },
};

export const viewport = { themeColor: "#050505", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className={`${lora.variable} ${poppins.variable}`}>
      <body>{children}</body>
    </html>
  );
}
