import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { TemplatePage } from '../components/TemplatePage';
import { setupAdminOffresPage } from '../lib/pageBehaviors';
import { adminOffresHtml } from '../lib/pageSources';
import { adminService } from '../services/adminService';

export default function AdminOffresPage() {
  const [offers, setOffers] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);

  const fetchOffers = () => {
    adminService.getOffers().then(res => {
      if (res.success && res.data) {
        setOffers(res.data.offers);
      }
    });
  };

  useEffect(() => {
    fetchOffers();
    adminService.getStats().then(res => {
      if (res.success && res.data) {
        setStats(res.data.stats);
      }
    });
  }, []);

  const handleToggleFeatured = async (offerId: string, isFeatured: boolean) => {
    console.log('handleToggleFeatured triggered:', { offerId, isFeatured });
    try {
      const res = await adminService.toggleOfferFeatured(offerId, isFeatured);
      if (res.success) {
        setOffers(prev => prev.map(o => o.id === offerId ? { ...o, isFeatured } : o));
        toast.success(isFeatured ? "Offre mise en avant sur la plateforme !" : "Mise en avant retirée.");
      } else {
        toast.error(res.message || "Erreur lors de la mise à jour.");
      }
      return res;
    } catch (error) {
      console.error('Error toggling featured:', error);
      toast.error("Échec de la mise à jour (vérifiez vos droits admin).");
      return { success: false };
    }
  };

  const handleUpdateStatus = async (offerId: string, status: string) => {
    console.log('handleUpdateStatus triggered:', { offerId, status });
    try {
      const res = await adminService.updateOfferStatus(offerId, status);
      if (res.success) {
        if (status === 'deleted') {
          setOffers(prev => prev.filter(o => o.id !== offerId));
          toast.success("Offre supprimée avec succès.");
        } else {
          setOffers(prev => prev.map(o => o.id === offerId ? { ...o, offerStatus: status } : o));
          toast.success(status === 'published' ? "Offre approuvée et publiée." : "Offre passée en brouillon.");
        }
      } else {
        toast.error(res.message || "Erreur lors du changement de statut.");
      }
      return res;
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error("Échec de l'action (vérifiez vos droits admin).");
      return { success: false };
    }
  };

  return (
    <TemplatePage 
      pageKey="admin-offres" 
      rawHtml={adminOffresHtml} 
      setup={(args) => setupAdminOffresPage({ 
        ...args, 
        offers, 
        stats,
        onToggleFeatured: handleToggleFeatured,
        onUpdateStatus: handleUpdateStatus
      })} 
    />
  );
}
