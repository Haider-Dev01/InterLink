export function buildDashboardProfile(user: Record<string, any> | null | undefined) {
  const firstName = user?.firstName || user?.profile?.firstName || '';
  const lastName = user?.lastName || user?.profile?.lastName || '';
  const fullName = `${firstName} ${lastName}`.trim() || user?.email || 'Utilisateur';

  return {
    name: fullName,
    role: user?.role || 'Candidat',
    image:
      user?.avatar ||
      user?.profile?.avatarUrl ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=00288e&color=fff&rounded=true`,
  };
}
