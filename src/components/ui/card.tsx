import * as React from "react";
import { cn } from "@/lib/utils";
import { BexCard, BexCardHeader, BexCardFooter, BexCardTitle, BexCardDescription, BexCardContent } from './bex-card';

// Auto-apply BEX Gaming variant to all Cards by default
const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { variant?: any; withGlow?: boolean }>(
  ({ variant, withGlow, ...props }, ref) => (
    <BexCard ref={ref} variant={variant || "gaming"} withGlow={withGlow !== false} {...props} />
  )
);
Card.displayName = "Card";

const CardHeader = BexCardHeader
const CardTitle = BexCardTitle
const CardDescription = BexCardDescription
const CardContent = BexCardContent
const CardFooter = BexCardFooter

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
