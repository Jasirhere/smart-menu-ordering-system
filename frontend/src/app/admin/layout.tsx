import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-[#fcf9f8]">
      <AdminSidebar />

      <div className="min-h-screen md:ml-64">{children}</div>
    </div>
  );
}