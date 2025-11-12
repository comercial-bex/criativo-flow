import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, BellOff, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/lib/toast-compat';

// VAPID public key - Em produção, isso virá de variável de ambiente
const VAPID_PUBLIC_KEY = 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SxRvG6-YkJx8Gg9zLGS9E0Y8pXOB-XE5PDOsPzCJp_1YdKRzL3xCPX0';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function PushNotificationSetup() {
  const { user } = useAuth();
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [loading, setLoading] = useState(false);
  const [hasSubscription, setHasSubscription] = useState(false);

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
      checkExistingSubscription();
    }
  }, [user]);

  const checkExistingSubscription = async () => {
    if (!user || !('serviceWorker' in navigator)) return;

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setHasSubscription(!!subscription);
    } catch (error) {
      console.error('Erro ao verificar subscription:', error);
    }
  };

  const subscribeToPush = async () => {
    if (!user) {
      toast.error('Você precisa estar logado');
      return;
    }

    try {
      setLoading(true);

      // Verificar se service worker está registrado
      const registration = await navigator.serviceWorker.ready;
      
      // Criar subscription
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });

      // Salvar no Supabase
      const subscriptionData = subscription.toJSON();
      
      const { error } = await supabase
        .from('push_subscriptions')
        .insert({
          user_id: user.id,
          endpoint: subscription.endpoint,
          p256dh: subscriptionData.keys?.p256dh || '',
          auth: subscriptionData.keys?.auth || '',
          user_agent: navigator.userAgent
        });

      if (error) throw error;

      setHasSubscription(true);
      toast.success('Notificações ativadas com sucesso!');
    } catch (error: any) {
      console.error('Erro ao ativar notificações:', error);
      toast.error('Erro ao ativar notificações: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const requestPermission = async () => {
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        await subscribeToPush();
      } else if (result === 'denied') {
        toast.error('Você bloqueou as notificações. Ative nas configurações do navegador.');
      }
    } catch (error) {
      console.error('Erro ao solicitar permissão:', error);
      toast.error('Erro ao solicitar permissão para notificações');
    }
  };

  const unsubscribeFromPush = async () => {
    try {
      setLoading(true);
      
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        
        // Remover do Supabase
        await supabase
          .from('push_subscriptions')
          .delete()
          .eq('user_id', user?.id)
          .eq('endpoint', subscription.endpoint);
      }

      setHasSubscription(false);
      toast.success('Notificações desativadas');
    } catch (error) {
      console.error('Erro ao desativar notificações:', error);
      toast.error('Erro ao desativar notificações');
    } finally {
      setLoading(false);
    }
  };

  if (!('Notification' in window) || !('serviceWorker' in navigator)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="h-5 w-5" />
            Notificações Push
          </CardTitle>
          <CardDescription>
            Seu navegador não suporta notificações push
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {hasSubscription ? (
            <CheckCircle2 className="h-5 w-5 text-success" />
          ) : (
            <Bell className="h-5 w-5" />
          )}
          Notificações Push
        </CardTitle>
        <CardDescription>
          Receba notificações mesmo quando o app estiver fechado
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {permission === 'denied' && (
            <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
              Você bloqueou as notificações. Para ativar, acesse as configurações do navegador.
            </div>
          )}

          {hasSubscription ? (
            <Button
              variant="outline"
              onClick={unsubscribeFromPush}
              disabled={loading}
              className="w-full"
            >
              <BellOff className="h-4 w-4 mr-2" />
              {loading ? 'Desativando...' : 'Desativar Notificações'}
            </Button>
          ) : (
            <Button
              onClick={requestPermission}
              disabled={loading || permission === 'denied'}
              className="w-full"
            >
              <Bell className="h-4 w-4 mr-2" />
              {loading ? 'Ativando...' : 'Ativar Notificações Push'}
            </Button>
          )}

          <p className="text-xs text-muted-foreground">
            Você receberá notificações quando:
          </p>
          <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
            <li>Uma tarefa for atribuída para você</li>
            <li>Alguém comentar em suas tarefas</li>
            <li>Subtarefas forem atualizadas</li>
            <li>Aprovações forem solicitadas</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
