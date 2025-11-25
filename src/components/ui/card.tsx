import * as React from "react";
import { cn } from "@/lib/utils";
import { BexCard, BexCardHeader, BexCardFooter, BexCardTitle, BexCardDescription, BexCardContent } from './bex-card';
import { useThemeManager } from "@/contexts/ThemeManagerContext";

// Auto-apply BEX Gaming variant to all Cards by default
const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { variant?: any; withGlow?: boolean }>(
  ({ variant, withGlow, className, ...props }, ref) => {
    const { theme } = useThemeManager();
    
    return (
      <BexCard 
        ref={ref} 
        variant={variant || "gaming"} 
        withGlow={withGlow !== false}
        className={cn(theme === 'bex-gamer' && 'hover-glow', className)}
        {...props} 
      />
    );
  }
);
Card.displayName = "Card";

const CardHeader = BexCardHeader
const CardTitle = BexCardTitle
const CardDescription = BexCardDescription
const CardContent = BexCardContent
const CardFooter = BexCardFooter

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
