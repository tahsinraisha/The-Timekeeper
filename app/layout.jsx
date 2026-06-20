import "./globals.css";

export const metadata = {
  title: "The Timekeeper — An Interactive Cinematic Experience",
  description:
    "A scroll-driven 3D story following Elias Voss, a young watchmaker who discovers a clock capable of manipulating time.",
  openGraph: {
    title: "The Timekeeper",
    description: "An interactive cinematic experience",
    type: "website",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#000000",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, background: "#000", overflow: "hidden" }}>
        {children}
      </body>
    </html>
  );
}
