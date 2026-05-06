import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { TemplatePage } from '../components/TemplatePage';
import { setupAdminUsersPage } from '../lib/pageBehaviors';
import { adminUtilisateursHtml } from '../lib/pageSources';
import { adminService } from '../services/adminService';

export default function AdminUtilisateursPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [pendingCompanies, setPendingCompanies] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [totalBanned, setTotalBanned] = useState(0);
  const [activeTab, setActiveTab] = useState('tous');

  useEffect(() => {
    adminService.getUsers(1, 100).then(res => {
      if (res.success && res.data) {
        setUsers(res.data.users);
        setTotalBanned(res.data.totalBanned);
      }
    });

    adminService.getStats().then(res => {
      if (res.success && res.data) {
        setStats(res.data.stats);
      }
    });

    adminService.getPendingCompanies().then(res => {
      if (res.success) {
        setPendingCompanies(res.data);
      }
    });
  }, []);

  const handleBanUser = async (userId: string) => {
    const res = await adminService.banUser(userId);
    if (res.success) {
      const targetUser = users.find(u => u.id === userId);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, isBanned: true } : u));
      setTotalBanned(prev => prev + 1);
      
      if (targetUser && stats) {
        setStats({
          ...stats,
          totalCandidates: targetUser.role === 'candidate' ? stats.totalCandidates - 1 : stats.totalCandidates,
          totalRecruiters: targetUser.role === 'recruiter' ? stats.totalRecruiters - 1 : stats.totalRecruiters,
        });
      }
      toast.success("Utilisateur banni.");
    }
    return res;
  };

  const handleUnbanUser = async (userId: string) => {
    const res = await adminService.unbanUser(userId);
    if (res.success) {
      const targetUser = users.find(u => u.id === userId);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, isBanned: false } : u));
      setTotalBanned(prev => Math.max(0, prev - 1));

      if (targetUser && stats) {
        setStats({
          ...stats,
          totalCandidates: targetUser.role === 'candidate' ? stats.totalCandidates + 1 : stats.totalCandidates,
          totalRecruiters: targetUser.role === 'recruiter' ? stats.totalRecruiters + 1 : stats.totalRecruiters,
        });
      }
      toast.success("Compte réactivé.");
    }
    return res;
  };

  const handleVerifyCompany = async (companyId: string) => {
    const res = await adminService.verifyCompany(companyId);
    if (res.success) {
      setPendingCompanies(prev => prev.filter(c => c.id !== companyId));
      toast.success("Entreprise validée. Le recruteur a maintenant accès à la création d'offres.");
      
      // Refresh stats and users to reflect new recruiter
      adminService.getStats().then(r => r.success && setStats(r.data.stats));
      adminService.getUsers(1, 100).then(r => r.success && setUsers(r.data.users));
    }
    return res;
  };

  const handleRejectCompany = async (companyId: string, reason: string) => {
    const res = await adminService.rejectCompany(companyId, reason);
    if (res.success) {
      setPendingCompanies(prev => prev.filter(c => c.id !== companyId));
      toast.error("Entreprise rejetée.");
    }
    return res;
  };

  const filteredUsers = users.filter(user => {
    if (activeTab === 'bannis') return user.isBanned;
    if (activeTab === 'etudiants') return user.role === 'candidate' && !user.isBanned;
    if (activeTab === 'recruteurs') return user.role === 'recruiter' && !user.isBanned;
    return true; // 'tous'
  });

  return (
    <TemplatePage 
      pageKey="admin-utilisateurs" 
      rawHtml={adminUtilisateursHtml} 
      setup={(args) => setupAdminUsersPage({ 
        ...args, 
        users: activeTab === 'validations' ? pendingCompanies.map(c => ({
          ...c.user,
          companyName: c.name,
          isPendingValidation: true,
          companyId: c.id
        })) : filteredUsers, 
        stats: {
          ...stats,
          pendingValidations: pendingCompanies.length
        },
        totalBanned,
        activeTab,
        onTabChange: setActiveTab,
        onBan: handleBanUser,
        onUnban: handleUnbanUser,
        onVerify: handleVerifyCompany,
        onReject: handleRejectCompany
      })} 
    />
  );
}
