import { useEffect, useState } from 'react';
import { TemplatePage } from '../components/TemplatePage';
import { setupAdminUsersPage } from '../lib/pageBehaviors';
import { adminUtilisateursHtml } from '../lib/pageSources';
import { adminService } from '../services/adminService';

export default function AdminUtilisateursPage() {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    adminService.getUsers().then(res => {
      if (res.success && res.data) {
        setUsers(res.data);
      }
    });
  }, []);

  return <TemplatePage pageKey="admin-utilisateurs" rawHtml={adminUtilisateursHtml} setup={(args) => setupAdminUsersPage({ ...args, users })} />;
}
