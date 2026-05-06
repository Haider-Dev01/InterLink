import { applicationRepository } from './application.repository';
import { prisma } from '../../shared/config/prismaClient';
import { AppError } from '../../shared/errors/AppError';
import { notificationService } from '../notification/notification.service';
import { recalculateMatch } from '../offer/matching.service';

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  pending: ['interview', 'rejected', 'withdrawn'],
  interview: ['accepted', 'rejected'],
  accepted: [],
  rejected: [],
  withdrawn: []
};

export class ApplicationService {
  async apply(candidateId: string, offerId: string, coverLetter?: string) {
    // Vérifier si l'offre existe et est publiée
    const offer = await prisma.jobOffer.findUnique({ 
      where: { id: offerId },
      select: { id: true, title: true, offerStatus: true, recruiterId: true }
    });
    if (!offer) {
      throw new AppError('Offre introuvable.', 404);
    }

    // Vérifier si l'utilisateur est banni
    const user = await prisma.user.findUnique({ where: { id: candidateId } });
    if (user?.isBanned) {
      throw new AppError('Votre compte a été suspendu par un administrateur. Vous ne pouvez plus postuler.', 403);
    }

    if (offer.offerStatus !== 'published') {
      throw new AppError('Vous ne pouvez postuler qu\'à des offres publiées.', 400);
    }

    // Vérifier si déjà postulé
    const existing = await applicationRepository.findByCandidate(candidateId);
    if (existing.some(a => a.offerId === offerId)) {
      throw new AppError('Vous avez déjà postulé à cette offre.', 400);
    }

    const application = await applicationRepository.create({ candidateId, offerId, coverLetter });

    // Récupérer le nom du candidat pour la notification
    const candidate = await prisma.user.findUnique({ 
      where: { id: candidateId },
      include: { profile: true }
    });
    const candidateName = candidate?.profile?.firstName 
      ? `${candidate.profile.firstName} ${candidate.profile.lastName}`
      : 'Un candidat';

    await notificationService.notify(
      offer.recruiterId,
      'APPLICATION_SUBMITTED',
      'Nouvelle candidature reçue',
      { applicationId: application.id, offerTitle: offer.title, candidateName }
    );

    // Calculer le score de matching immédiatement pour que le recruteur le voie
    recalculateMatch(candidateId, offerId).catch(err => 
      console.error(`[Matching] Error during on-apply recalculation:`, err)
    );

    return application;
  }

  async getMyApplications(candidateId: string) {
    return applicationRepository.findByCandidate(candidateId);
  }

  async getOfferApplications(offerId: string, recruiterId: string) {
    // Vérifier la propriété de l'offre
    const offer = await prisma.jobOffer.findUnique({ 
      where: { id: offerId },
      select: { id: true, recruiterId: true }
    });
    if (!offer) {
      throw new AppError('Offre introuvable.', 404);
    }
    if (offer.recruiterId !== recruiterId) {
      throw new AppError('Accès refusé.', 403);
    }

    return applicationRepository.findByOffer(offerId);
  }

  async getRecruiterApplications(recruiterId: string, offerId?: string) {
    const applications = await applicationRepository.findByRecruiter(recruiterId, offerId);
    
    // Récupérer toutes les connexions du recruteur pour mapper le statut
    const connections = await prisma.connection.findMany({
      where: {
        OR: [{ requesterId: recruiterId }, { receiverId: recruiterId }]
      }
    });

    return applications.map(app => {
      const conn = connections.find(c => 
        (c.requesterId === recruiterId && c.receiverId === app.candidateId) ||
        (c.requesterId === app.candidateId && c.receiverId === recruiterId)
      );

      const cvUrl = app.candidate?.cvDocuments?.[0]?.fileUrl || null;

      return {
        ...app,
        cvUrl,
        connectionStatus: conn ? conn.status : 'none',
        connectionId: conn ? conn.id : null
      };
    });
  }

  async updateStatus(id: string, status: string, userId: string, userRole: string) {
    const application = await applicationRepository.findById(id);
    if (!application) {
      throw new AppError('Candidature introuvable.', 404);
    }

    // Vérifier la propriété si c'est un recruteur (l'admin peut passer)
    if (userRole !== 'admin' && application.offer.recruiterId !== userId) {
      throw new AppError('Accès refusé.', 403);
    }

    // Vérification de la machine à états
    const currentStatus = application.applicationStatus;
    if (!ALLOWED_TRANSITIONS[currentStatus]?.includes(status)) {
      throw new AppError(`Transition invalide de ${currentStatus} vers ${status}`, 400);
    }

    const updatedApplication = await applicationRepository.updateStatus(id, status as any);

    let notificationType = 'APPLICATION_STATUS_CHANGED';
    let title = 'Votre candidature évolue';
    let payload: any = { applicationId: id, offerTitle: application.offer.title, newStatus: status };

    if (status === 'interview') {
      notificationType = 'APPLICATION_STATUS_CHANGED';
      title = 'Votre candidature évolue';
    } else if (status === 'accepted') {
      notificationType = 'APPLICATION_ACCEPTED';
      title = '🎉 Félicitations ! Candidature acceptée';
      const companyName = (application.offer as any).company?.name || 'L\'entreprise';
      payload.companyName = companyName;
    } else if (status === 'rejected') {
      notificationType = 'APPLICATION_REJECTED';
      title = 'Candidature non retenue';
    }

    await notificationService.notify(
      application.candidateId,
      notificationType,
      title,
      payload
    );

    return updatedApplication;
  }

  async withdrawApplication(id: string, candidateId: string) {
    const application = await applicationRepository.findById(id);
    if (!application) {
      throw new AppError('Candidature introuvable.', 404);
    }
    if (application.candidateId !== candidateId) {
      throw new AppError('Accès refusé.', 403);
    }
    if (application.applicationStatus !== 'pending') {
      throw new AppError('Impossible de retirer une candidature qui n\'est plus en attente.', 400);
    }

    const updatedApplication = await applicationRepository.updateStatus(id, 'withdrawn');

    const candidateName = application.candidate?.profile?.firstName 
      ? `${application.candidate.profile.firstName} ${application.candidate.profile.lastName}`
      : 'Un candidat';

    await notificationService.notify(
      application.offer.recruiterId,
      'APPLICATION_WITHDRAWN',
      'Candidature retirée',
      { applicationId: id, offerTitle: application.offer.title, candidateName }
    );

    return updatedApplication;
  }
}

export const applicationService = new ApplicationService();
