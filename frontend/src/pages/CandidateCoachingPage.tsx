import { useEffect, useMemo, useRef, useState } from 'react';

import { DashboardShell } from '../components/dashboard/DashboardShell';
import { ProgressMetric, SurfaceCard } from '../components/dashboard/DashboardPrimitives';
import { candidateNavItems } from '../lib/data/dashboardData';
import { buildDashboardProfile } from '../lib/userProfile';
import { useReactPageAnimations } from '../lib/reactPageAnimations';
import { aiAdviceService } from '../services/aiAdviceService';
import { aiService } from '../services/aiService';
import { notificationsService } from '../services/notificationsService';
import { useAuthStore } from '../store/authStore';

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  context?: {
    sources?: string[];
  };
};

export default function CandidateCoachingPage() {
  const rootRef = useRef(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  useReactPageAnimations(rootRef);

  const authUser = useAuthStore((state) => state.user);
  const [tips, setTips] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [prompt, setPrompt] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([aiAdviceService.getDailyAdvice(), notificationsService.list(), aiService.getAiChatHistory()])
      .then(([tipsRes, notifRes, historyRes]) => {
        setTips(tipsRes.data?.tips ?? []);
        setNotifications(notifRes.data?.notifications ?? []);
        setMessages((historyRes.data?.messages ?? []) as ChatMessage[]);
      })
      .catch((error) => {
        console.error('Failed to load coaching data', error);
      });
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, submitting]);

  const canSend = prompt.trim().length > 0 && !submitting;

  const conversationProgress = useMemo(() => {
    const assistantCount = messages.filter((message) => message.role === 'assistant').length;
    return Math.min(100, Math.max(20, assistantCount * 12));
  }, [messages]);

  const handleSend = async () => {
    const message = prompt.trim();
    if (!message || submitting) {
      return;
    }

    setSubmitting(true);
    setPrompt('');

    const tempId = `tmp-${Date.now()}`;
    setMessages((previous) => [...previous, { id: tempId, role: 'user', content: message }]);

    try {
      const response = await aiService.sendAiChatMessage(message);
      setMessages((response.data?.messages ?? []) as ChatMessage[]);
    } catch (error) {
      console.error('Failed to send coaching message', error);
      setMessages((previous) => [
        ...previous,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content:
            "Je n'ai pas pu repondre pour le moment. Verifiez que votre CV est bien analyse puis reessayez dans quelques secondes.",
        },
      ]);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div ref={rootRef}>
      <DashboardShell
        action={{ icon: 'search', label: 'Trouver un stage', to: '/candidate/dashboard/trouver-stage' }}
        navItems={candidateNavItems}
        profile={buildDashboardProfile(authUser)}
        searchPlaceholder="Rechercher un exercice..."
        sectionLabel="Espace Candidat"
        title="Coaching IA"
      >
        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <SurfaceCard className="overflow-hidden p-0" data-animate="card">
            <div className="bg-gradient-to-br from-primary to-secondary p-8 text-white">
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/70">Career Coach</p>
              <h2 className="mt-4 text-3xl font-black">Coaching personnalisé</h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-white/80">
                Le coach utilise votre CV, votre profil et votre historique pour repondre avec du contexte reel.
              </p>
              <div className="mt-6">
                <ProgressMetric animated inverted label="Progression coaching" value={conversationProgress} />
              </div>
            </div>

            <div className="flex h-[560px] flex-col p-6">
              <div className="flex-1 space-y-3 overflow-y-auto rounded-2xl border border-surface-variant bg-surface p-4">
                {!messages.length ? (
                  <p className="text-sm text-on-surface-variant">
                    Posez une question sur votre CV, vos candidatures, votre pitch entretien ou votre plan de carriere.
                  </p>
                ) : null}

                {messages.map((message) => {
                  const isUser = message.role === 'user';
                  const sources = message.context?.sources ?? [];
                  return (
                    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`} key={message.id}>
                      <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${isUser ? 'bg-primary text-white' : 'border border-surface-variant bg-white text-on-surface-variant'}`}>
                        <p className="text-xs font-black uppercase tracking-widest">{isUser ? 'Toi' : 'Coach IA'}</p>
                        <p className="mt-2 whitespace-pre-wrap text-sm leading-7">{message.content}</p>
                        {!isUser && sources.length ? (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {sources.slice(0, 4).map((source) => (
                              <span className="rounded-full bg-surface px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant" key={`${message.id}-${source}`}>
                                {source}
                              </span>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              <div className="mt-4 rounded-2xl border border-surface-variant bg-white p-4">
                <textarea
                  className="min-h-24 w-full resize-none border-none text-sm leading-7 text-on-surface-variant outline-none"
                  onChange={(event) => setPrompt(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                      event.preventDefault();
                      if (canSend) {
                        handleSend();
                      }
                    }
                  }}
                  placeholder="Ex: Comment adapter mon CV pour un stage Frontend React ?"
                  value={prompt}
                />
                <div className="mt-3 flex justify-end">
                  <button
                    className="interactive-scale rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-xl shadow-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={!canSend}
                    onClick={handleSend}
                    type="button"
                  >
                    {submitting ? 'Envoi...' : 'Envoyer'}
                  </button>
                </div>
              </div>
            </div>
          </SurfaceCard>

          <SurfaceCard className="p-8" data-animate="card">
            <h3 className="text-2xl font-black text-on-surface">Suggestions IA</h3>
            <div className="mt-8 space-y-6">
              {tips.map((tip, index) => (
                <div className="space-y-3" key={`tip-${index}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="text-lg font-black text-on-surface">Focus #{index + 1}</h4>
                      <p className="mt-1 text-xs font-black uppercase tracking-widest text-primary">Career Strategy</p>
                    </div>
                    <span className="rounded-full bg-surface px-3 py-1 text-xs font-bold text-on-surface-variant">{Math.max(45, 90 - index * 12)}%</span>
                  </div>
                  <p className="text-sm text-on-surface-variant">{tip}</p>
                  <ProgressMetric label="Impact estime" value={Math.max(45, 90 - index * 12)} />
                </div>
              ))}

              {!tips.length ? <p className="text-sm text-on-surface-variant">Aucune suggestion disponible.</p> : null}

              {notifications.slice(0, 2).map((notification) => (
                <div className="rounded-xl border border-surface-variant bg-surface p-4" key={notification.id}>
                  <p className="text-xs font-black uppercase tracking-widest text-on-surface-variant">Signal plateforme</p>
                  <p className="mt-2 text-sm text-on-surface-variant">{notification.title}</p>
                </div>
              ))}
            </div>
          </SurfaceCard>
        </div>
      </DashboardShell>
    </div>
  );
}
