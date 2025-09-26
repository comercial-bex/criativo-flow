import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { usePermissions } from '@/hooks/usePermissions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function DebugPanel() {
  const [isVisible, setIsVisible] = useState(false);
  const { user, session, loading: authLoading } = useAuth();
  const { role, loading: roleLoading } = useUserRole();
  const { getDefaultRoute, loading: permissionsLoading } = usePermissions();

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button 
          onClick={() => setIsVisible(true)}
          variant="outline"
          size="sm"
          className="bg-background shadow-lg"
        >
          🐛 Debug
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <Card className="shadow-lg">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Debug Panel</CardTitle>
            <Button 
              onClick={() => setIsVisible(false)}
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
            >
              ×
            </Button>
          </div>
        </CardHeader>
        <CardContent className="text-xs space-y-2">
          <div className="space-y-1">
            <div className="font-medium">Authentication:</div>
            <div className="pl-2 space-y-1">
              <div>Loading: <Badge variant={authLoading ? "destructive" : "secondary"}>{authLoading ? "Yes" : "No"}</Badge></div>
              <div>User: <Badge variant={user ? "default" : "secondary"}>{user ? "Logged in" : "Not logged in"}</Badge></div>
              <div>Session: <Badge variant={session ? "default" : "secondary"}>{session ? "Active" : "None"}</Badge></div>
              {user && <div className="text-xs text-muted-foreground">ID: {user.id?.slice(0, 8)}...</div>}
            </div>
          </div>

          <div className="space-y-1">
            <div className="font-medium">User Role:</div>
            <div className="pl-2 space-y-1">
              <div>Loading: <Badge variant={roleLoading ? "destructive" : "secondary"}>{roleLoading ? "Yes" : "No"}</Badge></div>
              <div>Role: <Badge>{role || "None"}</Badge></div>
            </div>
          </div>

          <div className="space-y-1">
            <div className="font-medium">Permissions:</div>
            <div className="pl-2 space-y-1">
              <div>Loading: <Badge variant={permissionsLoading ? "destructive" : "secondary"}>{permissionsLoading ? "Yes" : "No"}</Badge></div>
              <div>Default Route: <Badge variant="outline">{getDefaultRoute()}</Badge></div>
            </div>
          </div>

          <div className="space-y-1">
            <div className="font-medium">Current:</div>
            <div className="pl-2 space-y-1">
              <div>Path: <Badge variant="outline">{window.location.pathname}</Badge></div>
              <div>Time: <Badge variant="outline">{new Date().toLocaleTimeString()}</Badge></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}