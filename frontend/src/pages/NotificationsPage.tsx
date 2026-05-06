import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { DashboardShell } from '../components/dashboard/DashboardShell';
import { SurfaceCard } from '../components/dashboard/DashboardPrimitives';
import { candidateNavItems, recruiterNavItems } from '../lib/data/dashboardData';
import { useReactPageAnimations } from '../lib/reactPageAnimations';
import { notificationsService } from '../services/notificationsService';
import { connectionService } from '../services/connectionService';
import { useAuthStore } from '../store/authStore';

export default function NotificationsPage() {
  const rootRef = useRef(null);
  useReactPageAnimations(rootRef);
  const navigate = useNavigate();
  const authUser = useAuthStore((state) => state.user);

  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isActionLoading, setIsActionLoading] = useState<string | null>(null);

  const load = async () => {
    try {
      const res = await notificationsService.list();
      setNotifications(res.data?.notifications ?? []);
      setUnreadCount(res.data?.unreadCount ?? 0);
    } catch (err) {
      console.error('Failed to load notifications', err);
    }
  };

  useEffect(() => {
    load();

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
      role: authUser?.role === 'recruiter' ? 'Recruteur' : 'Candidat',
      image:
        authUser?.avatar ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=00288e&color=fff&rounded=true`,
    };
  }, [authUser]);

  const navItems = useMemo(() => {
    return authUser?.role === 'recruiter' ? recruiterNavItems : candidateNavItems;
  }, [authUser]);

  const handleRead = async (id: string) => {
    await notificationsService.markRead(id);
    await load();
  };

  const handleReadAll = async () => {
    await notificationsService.markAllRead();
    await load();
  };

  const handleAcceptConnection = async (notificationId: string, requesterId: string) => {
    setIsActionLoading(notificationId);
    try {
      await connectionService.acceptConnection(requesterId);
      await notificationsService.markRead(notificationId);
      await load();
      window.alert('Invitation acceptee ! Vous pouvez maintenant discuter.');
      navigate('/messages');
    } catch (err) {
      console.error('Failed to accept connection', err);
    } finally {
      setIsActionLoading(null);
    }
  };

  const handleRejectConnection = async (notificationId: string, requesterId: string) => {
    setIsActionLoading(notificationId);
    try {
      await connectionService.rejectConnection(requesterId);
      await notificationsService.markRead(notificationId);
      await load();
    } catch (err) {
      console.error('Failed to reject connection', err);
    } finally {
      setIsActionLoading(null);
    }
  };

  return (
    <div ref={rootRef}>
      <DashboardShell
        action={authUser?.role === 'candidate' ? { icon: 'home', label: 'Retour dashboard', to: '/candidate/dashboard' } : undefined}
        navItems={navItems}
        onAvatarClick={() => navigate('/profile/me')}
        onNotificationsClick={() => navigate('/notifications')}
        profile={profile}
        sectionLabel={authUser?.role === 'recruiter' ? 'Espace Recruteur' : 'Espace Candidat'}
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

          <div className="space-y-4">
            {notifications.map((notification) => {
              const isConnectionRequest = notification.type === 'CONNECTION_REQUEST';
              const requesterId = notification.payload?.requesterId;

              return (
                <div className={`rounded-xl border p-5 ${notification.isRead ? 'border-surface-variant bg-surface' : 'border-primary/30 bg-primary/5 shadow-sm'}`} key={notification.id}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="material-symbols-outlined text-primary text-sm">
                          {isConnectionRequest ? 'person_add' : 'notifications'}
                        </span>
                        <p className="text-sm font-bold text-on-surface">{notification.title}</p>
                      </div>
                      <p className="text-xs text-on-surface-variant mb-2">{new Date(notification.createdAt).toLocaleString()}</p>
                      
                      {isConnectionRequest ? (
                        <div className="mt-4">
                          <p className="text-sm text-on-surface-variant mb-4">
                            <strong>{notification.payload?.senderName || 'Un utilisateur'}</strong> souhaite se connecter avec vous.
                          </p>
                          <div className="flex gap-3">
                            <button
                              disabled={isActionLoading === notification.id}
                              onClick={() => handleAcceptConnection(notification.id, requesterId)}
                              className="interactive-scale bg-primary text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest shadow-md hover:bg-primary/90 transition-all disabled:opacity-50"
                            >
                              Accepter
                            </button>
                            <button
                              disabled={isActionLoading === notification.id}
                              onClick={() => handleRejectConnection(notification.id, requesterId)}
                              className="interactive-scale border border-surface-variant bg-white text-on-surface-variant px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-surface transition-all disabled:opacity-50"
                            >
                              Refuser
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-on-surface-variant">{notification.payload?.message || notification.payload?.offerTitle || ''}</p>
                      )}
                    </div>
                    
                    {!notification.isRead && !isConnectionRequest ? (
                      <button className="interactive-scale rounded-lg bg-primary/10 text-primary px-3 py-1.5 text-xs font-black" onClick={() => handleRead(notification.id)} type="button">
                        Lu
                      </button>
                    ) : null}
                  </div>
                </div>
              );
            })}

            {!notifications.length ? (
              <div className="py-12 text-center">
                <span className="material-symbols-outlined text-4xl text-on-surface-variant/30 mb-2">notifications_off</span>
                <p className="text-sm text-on-surface-variant">Aucune notification pour le moment.</p>
              </div>
            ) : null}
          </div>
        </SurfaceCard>
      </DashboardShell>
    </div>
  );
}
