export const metadata = {
  title: 'Hub | Mission Control',
  description: 'Agent Hub Mission Control - Stream Management',
};

export default function HubLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="ph">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
