import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import DotMatrixBrand from "@/components/ui/DotMatrixBrand";
import FloatingAvatar from "@/components/widget/FloatingAvatar";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <div className="mt-2">
        <DotMatrixBrand />
      </div>
      <FloatingAvatar />
    </>
  );
}
