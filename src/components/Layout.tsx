import { ResponsiveLayout } from "@/components/ResponsiveLayout";

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function Layout({ children, className }: LayoutProps) {
  return <ResponsiveLayout className={className}>{children}</ResponsiveLayout>;
}