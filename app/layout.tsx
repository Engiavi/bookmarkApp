import "./globals.css";

export const metadata = {
  title: "Realtime Bookmark Manager",
  description: "Bookmark manager with Google OAuth and Supabase realtime",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-100 min-h-screen text-gray-800">
        {children}
      </body>
    </html>
  );
}
