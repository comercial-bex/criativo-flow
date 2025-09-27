import { ResponsiveLayout } from "@/components/ResponsiveLayout";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return <ResponsiveLayout>{children}</ResponsiveLayout>;
}