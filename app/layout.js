import "./globals.css";

export const metadata = {
  title: "Ledger Lens",
  description: "A simple financial activity dashboard with role-based controls.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
