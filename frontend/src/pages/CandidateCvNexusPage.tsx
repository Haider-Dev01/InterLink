import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';

import { DashboardShell } from '../components/dashboard/DashboardShell';
import { ProgressMetric, SurfaceCard } from '../components/dashboard/DashboardPrimitives';
import { candidateNavItems } from '../lib/data/dashboardData';
import { buildDashboardProfile } from '../lib/userProfile';
import { useReactPageAnimations } from '../lib/reactPageAnimations';
import { aiAdviceService } from '../services/aiAdviceService';
import { cvService } from '../services/cvService';
import { useAuthStore } from '../store/authStore';

export default function CandidateCvNexusPage() {
  const rootRef = useRef(null);
  useReactPageAnimations(rootRef);

  const authUser = useAuthStore((state) => state.user);
  const [cv, setCv] = useState<any>(null);
  const [skills, setSkills] = useState<string[]>([]);
  const [tips, setTips] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [isRefreshingParse, setIsRefreshingParse] = useState(false);

  const load = async () => {
    const [cvRes, skillsRes, tipsRes] = await Promise.all([
      cvService.getMe(),
      cvService.getSkills(),
      aiAdviceService.getDailyAdvice(),
    ]);

    setCv(cvRes.data?.cv ?? null);
    setSkills(skillsRes.data?.skills ?? []);
    setTips(tipsRes.data?.tips ?? []);
  };

  useEffect(() => {
    load().catch((error) => {
      console.error('Failed to load CV nexus', error);
    });
  }, []);

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      setUploading(true);
      await cvService.uploadCv(file);
      await load();

      setIsRefreshingParse(true);
      for (let attempt = 0; attempt < 10; attempt += 1) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        const cvRes = await cvService.getMe();
        const nextCv = cvRes.data?.cv ?? null;
        setCv(nextCv);
        if (nextCv?.parseStatus === 'done' || nextCv?.parseStatus === 'failed') {
          const skillsRes = await cvService.getSkills();
          setSkills(skillsRes.data?.skills ?? []);
          break;
        }
      }
    } catch (error) {
      console.error('CV upload failed', error);
    } finally {
      setIsRefreshingParse(false);
      setUploading(false);
      event.target.value = '';
    }
  };

  return (
    <div ref={rootRef}>
      <DashboardShell
        action={{ icon: 'search', label: 'Trouver un stage', to: '/candidate/dashboard/trouver-stage' }}
        navItems={candidateNavItems}
        profile={buildDashboardProfile(authUser)}
        searchPlaceholder="Rechercher une section CV..."
        sectionLabel="Espace Candidat"
        title="CV Nexus"
      >
        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <SurfaceCard className="p-8" data-animate="card">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-on-surface">Structure du profil</h2>
                <p className="mt-2 text-sm text-on-surface-variant">Le moteur Nexus mesure la lisibilite et la pertinence de chaque section.</p>
              </div>
              <span className="rounded-full bg-primary/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-primary">{cv?.parseStatus || 'pending'}</span>
            </div>

            <div className="space-y-6">
              <div>
                <ProgressMetric label="Parsing CV" value={cv?.parseStatus === 'done' ? 100 : cv?.parseStatus === 'processing' ? 60 : 20} />
                <p className="mt-2 text-sm text-on-surface-variant">Statut: {cv?.parseStatus || 'Aucun CV actif'} {isRefreshingParse ? '(analyse en cours...)' : ''}</p>
              </div>
              <div>
                <ProgressMetric label="Competences detectees" value={Math.min(skills.length * 10, 100)} />
                <p className="mt-2 text-sm text-on-surface-variant">{skills.length} competences identifiees dans votre CV.</p>
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-on-surface-variant">Score de parsing</p>
                <p className="mt-2 text-sm text-on-surface-variant">{cv?.parsing?.score ?? 0}/100</p>
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-on-surface-variant">Top skills</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {skills.slice(0, 10).map((skill) => (
                    <span className="rounded-full bg-surface px-3 py-1.5 text-xs font-bold text-on-surface-variant" key={skill}>
                      {skill}
                    </span>
                  ))}
                  {!skills.length ? <span className="text-sm text-on-surface-variant">Aucune competence extraite pour le moment.</span> : null}
                </div>
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-on-surface-variant">Texte extrait (apercu)</p>
                <p className="mt-2 line-clamp-6 text-sm text-on-surface-variant">{cv?.parsedText || 'Le texte extrait apparaitra ici apres parsing.'}</p>
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-on-surface-variant">Sections detectees</p>
                <div className="mt-3 space-y-3">
                  {Object.entries(cv?.parsing?.sections ?? {}).map(([section, content]) => (
                    <div className="rounded-xl border border-surface-variant bg-surface p-3" key={section}>
                      <p className="text-xs font-black uppercase tracking-widest text-on-surface">{section}</p>
                      <p className="mt-1 text-sm text-on-surface-variant">{String(content)}</p>
                    </div>
                  ))}
                  {!Object.keys(cv?.parsing?.sections ?? {}).length ? <span className="text-sm text-on-surface-variant">Les sections apparaitront apres parsing.</span> : null}
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <label className="inline-flex cursor-pointer items-center gap-3 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white">
                  <span className="material-symbols-outlined text-[18px]">upload_file</span>
                  <span>{uploading ? 'Upload en cours...' : 'Mettre a jour CV'}</span>
                  <input accept=".pdf,.doc,.docx" className="hidden" disabled={uploading} onChange={handleUpload} type="file" />
                </label>

                {cv?.fileUrl ? (
                  <a className="inline-flex items-center gap-2 rounded-xl border border-surface-variant px-4 py-3 text-sm font-bold text-on-surface" href={cv.fileUrl} rel="noreferrer" target="_blank">
                    <span className="material-symbols-outlined text-[18px]">download</span>
                    <span>Voir ou telecharger le CV</span>
                  </a>
                ) : null}
              </div>
            </div>
          </SurfaceCard>

          <SurfaceCard className="p-8" data-animate="card">
            <h3 className="text-2xl font-black text-on-surface">Recommendations IA</h3>
            <div className="mt-6 space-y-4">
              {tips.map((tip, index) => (
                <div className={`${index === 0 ? 'bg-gradient-to-br from-primary to-secondary text-white' : 'border border-surface-variant bg-surface text-on-surface-variant'} rounded-[1.5rem] p-5`} key={`${tip}-${index}`}>
                  <p className={`text-xs font-black uppercase tracking-widest ${index === 0 ? 'text-white/70' : 'text-on-surface-variant'}`}>Conseil {index + 1}</p>
                  <p className={`mt-3 text-sm leading-7 ${index === 0 ? 'text-white' : 'text-on-surface-variant'}`}>{tip}</p>
                </div>
              ))}
              {!tips.length ? <p className="text-sm text-on-surface-variant">Aucun conseil disponible pour le moment.</p> : null}
            </div>
          </SurfaceCard>
        </div>
      </DashboardShell>
    </div>
  );
}
