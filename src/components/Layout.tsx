import { ResponsiveLayout } from "@/components/ResponsiveLayout";
import { PageTransition } from "@/components/PageTransition";

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function Layout({ children, className }: LayoutProps) {
  return (
    <ResponsiveLayout className={className}>
      <PageTransition>{children}</PageTransition>
    </ResponsiveLayout>
  );
}