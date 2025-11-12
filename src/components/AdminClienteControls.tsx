import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from '@/lib/toast-compat';
import { supabase } from "@/integrations/supabase/client";
import { CredentialsModal } from "@/components/CredentialsModal";
import { SimplifiedAdminControls } from "@/components/SimplifiedAdminControls";
import { 
  Shield, 
  Key, 
  UserX, 
  Trash2, 
  Clock,
  Eye,
  Settings,
  AlertTriangle
} from "lucide-react";
interface AdminClienteControlsProps {
  clienteId: string;
  clienteData: any;
}

export function AdminClienteControls({ clienteId, clienteData }: AdminClienteControlsProps) {
  return <SimplifiedAdminControls clienteId={clienteId} clienteData={clienteData} />;
}