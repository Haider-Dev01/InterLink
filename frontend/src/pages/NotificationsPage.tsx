import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { DashboardShell } from '../components/dashboard/DashboardShell';
import { SurfaceCard } from '../components/dashboard/DashboardPrimitives';
import { candidateNavItems } from '../lib/data/dashboardData';
import { useReactPageAnimations } from '../lib/reactPageAnimations';
import { notificationsService } from '../services/notificationsService';
import { useAuthStore } from '../store/authStore';

export default function NotificationsPage() {
  const rootRef = useRef(null);
  useReactPageAnimations(rootRef);
  const navigate = useNavigate();
  const authUser = useAuthStore((state) => state.user);

  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const load = async () => {
    const res = await notificationsService.list();
    setNotifications(res.data?.notifications ?? []);
    setUnreadCount(res.data?.unreadCount ?? 0);
  };

  useEffect(() => {
    load().catch((error) => {
      console.error('Failed to load notifications', error);
    });

    const interval = setInterval(() => {
      load().catch(() => undefined);
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const profile = useMemo(() => {
    const firstName = authUser?.firstName || authUser?.profile?.firstName || '';
    const lastName = authUser?.lastName || authUser?.profile?.lastName || '';
    const fullName = `${firstName} ${lastName}`.trim() || 'Utilisateur';

    return {
      name: fullName,
      role: authUser?.role || 'Candidat',
      image:
        authUser?.avatar ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=00288e&color=fff&rounded=true`,
    };
  }, [authUser]);

  const handleRead = async (id: string) => {
    await notificationsService.markRead(id);
    await load();
  };

  const handleReadAll = async () => {
    await notificationsService.markAllRead();
    await load();
  };

  return (
    <div ref={rootRef}>
      <DashboardShell
        action={{ icon: 'home', label: 'Retour dashboard', to: '/candidate/dashboard' }}
        navItems={candidateNavItems}
        onAvatarClick={() => navigate('/profile/me')}
        onNotificationsClick={() => navigate('/notifications')}
        profile={profile}
        sectionLabel="Espace Candidat"
        title="Notifications"
      >
        <SurfaceCard className="p-8" data-animate="card">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-black text-on-surface">Centre de notifications</h2>
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-black text-primary">{unreadCount} non lues</span>
              <button className="interactive-scale rounded-xl border border-surface-variant px-4 py-2 text-sm font-bold" onClick={handleReadAll} type="button">
                Tout marquer comme lu
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {notifications.map((notification) => (
              <div className={`rounded-xl border p-4 ${notification.isRead ? 'border-surface-variant bg-surface' : 'border-primary/30 bg-primary/5'}`} key={notification.id}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-on-surface">{notification.title}</p>
                    <p className="mt-1 text-xs text-on-surface-variant">{new Date(notification.createdAt).toLocaleString()}</p>
                    <p className="mt-2 text-sm text-on-surface-variant">{String(notification.type)}</p>
                  </div>
                  {!notification.isRead ? (
                    <button className="interactive-scale rounded-lg bg-primary px-3 py-2 text-xs font-black text-white" onClick={() => handleRead(notification.id)} type="button">
                      Marquer lu
                    </button>
                  ) : null}
                </div>
              </div>
            ))}

            {!notifications.length ? (
              <p className="py-6 text-center text-sm text-on-surface-variant">Aucune notification pour le moment.</p>
            ) : null}
          </div>
        </SurfaceCard>
      </DashboardShell>
    </div>
  );
}
