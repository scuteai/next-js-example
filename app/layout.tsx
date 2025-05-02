import Providers from "@/components/providers";
import "./globals.css";

export const metadata = {
  title: "Scute Next.js Example",
  description: "Scute Next.js Example",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <Providers>
        <body>{children}</body>
      </Providers>
    </html>
  );
}
