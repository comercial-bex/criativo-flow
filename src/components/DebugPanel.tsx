import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { usePermissions } from '@/hooks/usePermissions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw } from 'lucide-react';

export function DebugPanel() {
  const [isVisible, setIsVisible] = useState(false);
  const { user, session, loading: authLoading } = useAuth();
  const { role, loading: roleLoading } = useUserRole();
  const { 
    getDefaultRoute, 
    loading: permissionsLoading, 
    hasModuleAccess, 
    canPerformAction,
    dynamicPermissions 
  } = usePermissions();

  const handleRefresh = () => {
    window.location.reload();
  };

  const isJefferson = user?.email === 'jefferson@agenciabex.com.br';

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
        <CardContent className="text-xs space-y-2 max-h-96 overflow-y-auto">
          {/* Special Jefferson Status */}
          {isJefferson && (
            <div className="space-y-1 border-l-2 border-green-500 pl-2 bg-green-50 dark:bg-green-950 p-2 rounded">
              <div className="font-medium text-green-700 dark:text-green-300">🎯 Jefferson Status:</div>
              <div className="pl-2 space-y-1">
                <div>Admin Access: <Badge variant={role === 'admin' ? "default" : "destructive"}>{role === 'admin' ? "✅ YES" : "❌ NO"}</Badge></div>
                <div>Should Access Dashboard: <Badge variant="default">✅ YES</Badge></div>
                <div>Current Issue: <Badge variant="destructive">{window.location.pathname === '/unauthorized' ? 'Blocked' : 'Unknown'}</Badge></div>
              </div>
            </div>
          )}

          <div className="space-y-1">
            <div className="font-medium">Authentication:</div>
            <div className="pl-2 space-y-1">
              <div>Loading: <Badge variant={authLoading ? "destructive" : "secondary"}>{authLoading ? "Yes" : "No"}</Badge></div>
              <div>User: <Badge variant={user ? "default" : "secondary"}>{user ? "Logged in" : "Not logged in"}</Badge></div>
              <div>Session: <Badge variant={session ? "default" : "secondary"}>{session ? "Active" : "None"}</Badge></div>
              {user && (
                <>
                  <div className="text-xs text-muted-foreground">ID: {user.id?.slice(0, 8)}...</div>
                  <div className="text-xs text-muted-foreground">Email: {user.email}</div>
                </>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <div className="font-medium">User Role:</div>
            <div className="pl-2 space-y-1">
              <div>Loading: <Badge variant={roleLoading ? "destructive" : "secondary"}>{roleLoading ? "Yes" : "No"}</Badge></div>
              <div>Role: <Badge variant={role === 'admin' ? "default" : "secondary"}>{role || "None"}</Badge></div>
            </div>
          </div>

          <div className="space-y-1">
            <div className="font-medium">Permissions:</div>
            <div className="pl-2 space-y-1">
              <div>Loading: <Badge variant={permissionsLoading ? "destructive" : "secondary"}>{permissionsLoading ? "Yes" : "No"}</Badge></div>
              <div>Default Route: <Badge variant="outline">{getDefaultRoute()}</Badge></div>
              <div>Dashboard Access: <Badge variant={hasModuleAccess('dashboard') ? "default" : "destructive"}>{hasModuleAccess('dashboard') ? "✅" : "❌"}</Badge></div>
            </div>
          </div>

          {/* Module Access Status */}
          <div className="space-y-1">
            <div className="font-medium">Module Access:</div>
            <div className="pl-2 space-y-1 grid grid-cols-2 gap-1">
              {Object.keys(dynamicPermissions).map(module => (
                <div key={module} className="text-xs">
                  {module}: <Badge variant={hasModuleAccess(module as any) ? "default" : "destructive"} className="text-xs px-1">
                    {hasModuleAccess(module as any) ? "✅" : "❌"}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <div className="font-medium">Current:</div>
            <div className="pl-2 space-y-1">
              <div>Path: <Badge variant="outline">{window.location.pathname}</Badge></div>
              <div>Time: <Badge variant="outline">{new Date().toLocaleTimeString()}</Badge></div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-1">
            <div className="font-medium">Actions:</div>
            <div className="pl-2 space-y-1">
              <Button 
                onClick={handleRefresh} 
                variant="outline" 
                size="sm" 
                className="w-full text-xs h-6"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Refresh Page
              </Button>
              {isJefferson && (
                <Button 
                  onClick={() => window.location.href = '/dashboard'} 
                  variant="default" 
                  size="sm" 
                  className="w-full text-xs h-6"
                >
                  🎯 Force Dashboard
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}