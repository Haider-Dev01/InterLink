import { useEffect, useState } from 'react';
import { TemplatePage } from '../components/TemplatePage';
import { setupUserSettingsPage } from '../lib/pageBehaviors';
import { userSettingsHtml } from '../lib/pageSources';
import { profileService } from '../services/profileService';

export default function UserSettingsPage() {
  const [profileData, setProfileData] = useState<any>(null);

  useEffect(() => {
    profileService.getMe().then((res) => {
      if (res.success && res.data) {
        setProfileData(res.data);
      }
    });
  }, []);

  const handleUpdateProfile = async (data: any) => {
    return await profileService.updateMe(data);
  };

  // On attend d'avoir les données pour charger la page afin que le DOM soit correctement rempli
  if (!profileData) return null;

  return <TemplatePage pageKey="user-settings" rawHtml={userSettingsHtml} setup={(args) => setupUserSettingsPage({ ...args, profileData, onUpdate: handleUpdateProfile })} />;
}
