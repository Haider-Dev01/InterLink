import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import { DashboardShell } from '../components/dashboard/DashboardShell';
import { SurfaceCard } from '../components/dashboard/DashboardPrimitives';
import { candidateNavItems } from '../lib/data/dashboardData';
import { buildDashboardProfile } from '../lib/userProfile';
import { useReactPageAnimations } from '../lib/reactPageAnimations';
import { aiService } from '../services/aiService';
import { cvService } from '../services/cvService';
import { useAuthStore } from '../store/authStore';

export default function AnalyseCvPage() {
  const rootRef = useRef(null);
  useReactPageAnimations(rootRef);
  const navigate = useNavigate();
  const authUser = useAuthStore((state) => state.user);

  const [cv, setCv] = useState<any>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [optimized, setOptimized] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);

  useEffect(() => {
    cvService.getMe().then((response) => {
      setCv(response.data?.cv ?? null);
    }).catch((error) => {
      console.error('Failed to load current CV', error);
    });
  }, []);

  const handleAnalyze = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      setIsAnalyzing(true);
      const uploadResponse = await cvService.uploadCv(file);
      const analyzeResponse = await aiService.analyzeCv(file);
      const currentCvResponse = await cvService.getMe();

      setCv(currentCvResponse.data?.cv ?? null);
      setAnalysis({
        ...analyzeResponse.data,
        uploadedCvId: uploadResponse.data?.cvId,
      });
      setOptimized(null);
    } catch (error) {
      console.error('Failed to analyze CV', error);
    } finally {
      setIsAnalyzing(false);
      event.target.value = '';
    }
  };

  const handleOptimize = async () => {
    try {
      setIsOptimizing(true);
      const response = await aiService.optimizeCv({
        text: cv?.parsedText,
        focusSkills: analysis?.skills ?? [],
      });
      setOptimized(response.data);
    } catch (error) {
      console.error('Failed to optimize CV', error);
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <div ref={rootRef}>
      <DashboardShell
        action={{ icon: 'description', label: 'Mon CV Nexus', to: '/candidate/dashboard/cv-nexus' }}
        navItems={candidateNavItems}
        onAvatarClick={() => navigate('/profile/me')}
        onNotificationsClick={() => navigate('/notifications')}
        profile={buildDashboardProfile(authUser)}
        searchPlaceholder="Analyser une section du CV..."
        sectionLabel="Espace Candidat"
        title="Analyse CV"
      >
        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <SurfaceCard className="p-8" data-animate="card">
            <div className="space-y-5">
              <div>
                <h2 className="text-2xl font-black text-on-surface">Analyse Nexus</h2>
                <p className="mt-2 text-sm text-on-surface-variant">Le bouton ouvre le file picker, stocke le CV via le backend puis envoie le fichier au service FastAPI pour une analyse structuree.</p>
              </div>

              <label className="inline-flex cursor-pointer items-center gap-3 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white">
                <span className="material-symbols-outlined text-[18px]">analytics</span>
                <span>{isAnalyzing ? "Analyse en cours..." : "Lancer l'analyse Nexus"}</span>
                <input accept=".pdf,.doc,.docx" className="hidden" disabled={isAnalyzing} onChange={handleAnalyze} type="file" />
              </label>

              {cv?.fileUrl ? (
                <a className="inline-flex items-center gap-2 rounded-xl border border-surface-variant px-4 py-3 text-sm font-bold text-on-surface" href={cv.fileUrl} rel="noreferrer" target="_blank">
                  <span className="material-symbols-outlined text-[18px]">download</span>
                  <span>Ouvrir le CV courant</span>
                </a>
              ) : (
                <p className="text-sm text-on-surface-variant">Aucun CV actif pour le moment.</p>
              )}

              {analysis ? (
                <div className="rounded-2xl bg-surface p-5">
                  <p className="text-xs font-black uppercase tracking-widest text-primary">Score Nexus</p>
                  <p className="mt-2 text-4xl font-black text-on-surface">{analysis.score}/100</p>
                  <p className="mt-4 text-sm text-on-surface-variant">{analysis.summary}</p>
                </div>
              ) : null}

              <button className="interactive-scale rounded-xl border border-surface-variant px-4 py-3 text-sm font-bold text-on-surface disabled:cursor-not-allowed disabled:opacity-50" disabled={!analysis || isOptimizing} onClick={handleOptimize} type="button">
                {isOptimizing ? 'Optimisation en cours...' : 'Generer version optimisee'}
              </button>
            </div>
          </SurfaceCard>

          <div className="space-y-6">
            <SurfaceCard className="p-8" data-animate="card">
              <h3 className="text-2xl font-black text-on-surface">Competences detectees</h3>
              <div className="mt-5 flex flex-wrap gap-2">
                {(analysis?.skills ?? []).map((skill: string) => (
                  <span className="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary" key={skill}>
                    {skill}
                  </span>
                ))}
                {!analysis?.skills?.length ? <p className="text-sm text-on-surface-variant">Lancez une analyse pour obtenir les skills extraites.</p> : null}
              </div>
            </SurfaceCard>

            <SurfaceCard className="p-8" data-animate="card">
              <h3 className="text-2xl font-black text-on-surface">Suggestions</h3>
              <div className="mt-5 space-y-3">
                {(analysis?.suggestions ?? []).map((suggestion: string, index: number) => (
                  <div className="rounded-xl border border-surface-variant bg-surface px-4 py-3 text-sm text-on-surface-variant" key={`${suggestion}-${index}`}>
                    {suggestion}
                  </div>
                ))}
                {!analysis?.suggestions?.length ? <p className="text-sm text-on-surface-variant">Aucune suggestion disponible pour le moment.</p> : null}
              </div>
            </SurfaceCard>

            <SurfaceCard className="p-8" data-animate="card">
              <h3 className="text-2xl font-black text-on-surface">Version optimisee</h3>
              {optimized ? (
                <>
                  <div className="mt-5 space-y-3">
                    {optimized.highlights?.map((highlight: string, index: number) => (
                      <div className="rounded-xl bg-primary/10 px-4 py-3 text-sm font-medium text-primary" key={`${highlight}-${index}`}>
                        {highlight}
                      </div>
                    ))}
                  </div>
                  <pre className="mt-5 whitespace-pre-wrap rounded-2xl border border-surface-variant bg-surface p-5 text-sm leading-7 text-on-surface-variant">{optimized.optimized_text}</pre>
                </>
              ) : (
                <p className="mt-5 text-sm text-on-surface-variant">La version optimisee s'affichera ici apres appel de `POST /ai/optimize-cv`.</p>
              )}
            </SurfaceCard>
          </div>
        </div>
      </DashboardShell>
    </div>
  );
}
