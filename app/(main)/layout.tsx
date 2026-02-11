import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import DotMatrixBrand from "@/components/ui/DotMatrixBrand";

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
    </>
  );
}
