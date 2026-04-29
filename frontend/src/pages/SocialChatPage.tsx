import { useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { DashboardShell } from '../components/dashboard/DashboardShell';
import { SurfaceCard } from '../components/dashboard/DashboardPrimitives';
import { useReactPageAnimations } from '../lib/reactPageAnimations';
import { buildDashboardProfile } from '../lib/userProfile';
import { connectionService } from '../services/connectionService';
import { messageService } from '../services/messageService';
import { useAuthStore } from '../store/authStore';

type ConnectionUser = {
  id: string;
  email?: string;
  role?: string;
  firstName?: string | null;
  lastName?: string | null;
  avatarUrl?: string | null;
  avatar?: string | null;
};

type ConnectionItem = {
  id: string;
  user: ConnectionUser;
  connectedAt?: string;
};

type ChatMessage = {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
};

function userLabel(user: ConnectionUser) {
  const name = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();
  return name || user.email || 'Utilisateur';
}

export default function SocialChatPage() {
  const rootRef = useRef(null);
  useReactPageAnimations(rootRef);
  const navigate = useNavigate();
  const { userId } = useParams();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const authUser = useAuthStore((state) => state.user);
  const currentUserId = authUser?.id as string | undefined;

  const [connections, setConnections] = useState<ConnectionItem[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [peer, setPeer] = useState<ConnectionUser | null>(null);
  const [draft, setDraft] = useState('');
  const [loadingConnections, setLoadingConnections] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedUserId = userId ?? '';
  const selectedConnection = connections.find((connection) => connection.user.id === selectedUserId) ?? null;

  const homePath = useMemo(() => {
    const role = (authUser?.role || '').toLowerCase();
    if (role === 'recruiter') return '/recruiter/dashboard';
    if (role === 'admin') return '/admin/dashboard';
    return '/candidate/dashboard';
  }, [authUser?.role]);

  const navItems = useMemo(
    () => [
      { label: 'Tableau de bord', icon: 'dashboard', to: homePath },
      { label: 'Mon profil', icon: 'person', to: '/profile/me' },
      { label: 'Messagerie', icon: 'chat', to: '/messages' },
    ],
    [homePath],
  );

  async function loadConnections() {
    const response = await connectionService.getConnections();
    if (response.success && response.data) {
      setConnections((response.data.connections ?? []) as ConnectionItem[]);
      return;
    }

    throw new Error('Impossible de charger les connexions.');
  }

  async function loadConversation(targetUserId: string, showLoading = true) {
    if (!targetUserId) {
      setMessages([]);
      setPeer(null);
      return;
    }

    if (showLoading) {
      setLoadingMessages(true);
    }

    try {
      const response = await messageService.getConversation(targetUserId);
      if (response.success && response.data) {
        setMessages((response.data.messages ?? []) as ChatMessage[]);
        setPeer((response.data.peer ?? null) as ConnectionUser | null);
        setError(null);
      } else {
        setError('Conversation indisponible.');
      }
    } catch (err: any) {
      setMessages([]);
      setPeer(null);
      setError(err?.response?.data?.message || 'Impossible de charger cette conversation.');
    } finally {
      if (showLoading) {
        setLoadingMessages(false);
      }
    }
  }

  useEffect(() => {
    let active = true;
    setLoadingConnections(true);
    loadConnections()
      .catch((err: any) => {
        if (active) {
          setError(err?.response?.data?.message || err?.message || 'Erreur lors du chargement des connexions.');
        }
      })
      .finally(() => {
        if (active) {
          setLoadingConnections(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedUserId) {
      setMessages([]);
      setPeer(null);
      setError(null);
      return;
    }

    loadConversation(selectedUserId, true);
    const interval = window.setInterval(() => {
      loadConversation(selectedUserId, false);
    }, 3500);

    return () => {
      window.clearInterval(interval);
    };
  }, [selectedUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const content = draft.trim();
    if (!content || !selectedUserId || !currentUserId) {
      return;
    }

    setSending(true);
    try {
      await messageService.sendMessage(selectedUserId, content);
      setDraft('');
      await loadConversation(selectedUserId, false);
      setError(null);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Envoi impossible.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div ref={rootRef}>
      <DashboardShell
        action={{ icon: 'person_add', label: 'Mes connexions', to: '/messages' }}
        navItems={navItems}
        onAvatarClick={() => navigate('/profile/me')}
        onNotificationsClick={() => navigate('/notifications')}
        profile={buildDashboardProfile(authUser)}
        sectionLabel="Reseau InterLink"
        title="Messagerie"
      >
        <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <SurfaceCard className="p-4" data-animate="card">
            <div className="mb-3 px-2">
              <p className="text-xs font-black uppercase tracking-widest text-on-surface-variant">Connexions</p>
            </div>
            <div className="space-y-2">
              {loadingConnections ? (
                <p className="px-2 py-4 text-sm text-on-surface-variant">Chargement...</p>
              ) : connections.length === 0 ? (
                <p className="px-2 py-4 text-sm text-on-surface-variant">Aucune connexion acceptee pour le moment.</p>
              ) : (
                connections.map((connection) => {
                  const active = connection.user.id === selectedUserId;
                  const avatar =
                    connection.user.avatar ||
                    connection.user.avatarUrl ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(userLabel(connection.user))}&background=00288e&color=fff&rounded=true`;

                  return (
                    <button
                      className={`flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition-colors ${
                        active ? 'border-primary bg-primary/5' : 'border-surface-variant hover:border-primary/40 hover:bg-surface'
                      }`}
                      key={connection.id}
                      onClick={() => navigate(`/messages/${connection.user.id}`)}
                      type="button"
                    >
                      <img alt={userLabel(connection.user)} className="h-10 w-10 rounded-full object-cover" src={avatar} />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-on-surface">{userLabel(connection.user)}</p>
                        <p className="truncate text-xs text-on-surface-variant">{connection.user.role || 'Membre'}</p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </SurfaceCard>

          <SurfaceCard className="flex min-h-[560px] flex-col p-0" data-animate="card">
            {selectedUserId && selectedConnection ? (
              <>
                <div className="flex items-center justify-between border-b border-surface-variant px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img
                      alt={userLabel(peer ?? selectedConnection.user)}
                      className="h-11 w-11 rounded-full object-cover"
                      src={
                        peer?.avatar ||
                        peer?.avatarUrl ||
                        selectedConnection.user.avatar ||
                        selectedConnection.user.avatarUrl ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(userLabel(peer ?? selectedConnection.user))}&background=00288e&color=fff&rounded=true`
                      }
                    />
                    <div>
                      <p className="text-sm font-black text-on-surface">{userLabel(peer ?? selectedConnection.user)}</p>
                      <p className="text-xs text-on-surface-variant">Connexion acceptee</p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-5">
                  {loadingMessages ? (
                    <p className="text-sm text-on-surface-variant">Chargement des messages...</p>
                  ) : error ? (
                    <p className="text-sm text-red-600">{error}</p>
                  ) : messages.length === 0 ? (
                    <p className="text-sm text-on-surface-variant">Aucun message pour le moment. Dites bonjour.</p>
                  ) : (
                    <div className="space-y-3">
                      {messages.map((message) => {
                        const isMine = message.senderId === currentUserId;
                        return (
                          <div className={`flex ${isMine ? 'justify-end' : 'justify-start'}`} key={message.id}>
                            <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${isMine ? 'bg-primary text-white' : 'bg-surface text-on-surface'}`}>
                              <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                              <p className={`mt-1 text-[10px] ${isMine ? 'text-white/80' : 'text-on-surface-variant'}`}>
                                {new Date(message.createdAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>

                <form className="border-t border-surface-variant px-5 py-4" onSubmit={handleSend}>
                  <div className="flex items-end gap-3">
                    <textarea
                      className="min-h-[44px] flex-1 resize-none rounded-xl border border-surface-variant bg-surface px-4 py-3 text-sm outline-none focus:border-primary"
                      onChange={(event) => setDraft(event.target.value)}
                      placeholder="Ecrire un message..."
                      rows={2}
                      value={draft}
                    />
                    <button
                      className="interactive-scale rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white disabled:opacity-60"
                      disabled={sending || !draft.trim()}
                      type="submit"
                    >
                      {sending ? 'Envoi...' : 'Envoyer'}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex min-h-[560px] items-center justify-center px-6 text-center">
                <p className="text-sm font-medium text-on-surface-variant">
                  {connections.length ? 'Selectionnez une connexion pour commencer la conversation.' : 'Ajoutez des connexions pour demarrer la messagerie.'}
                </p>
              </div>
            )}
          </SurfaceCard>
        </div>
      </DashboardShell>
    </div>
  );
}
