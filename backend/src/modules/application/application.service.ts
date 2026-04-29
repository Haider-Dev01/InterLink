import { applicationRepository } from './application.repository';

export class ApplicationService {
  async apply(candidateId: string, offerId: string, coverLetter?: string) {
    // Check if already applied
    const existing = await applicationRepository.findByCandidate(candidateId);
    if (existing.some(a => a.offerId === offerId)) {
      throw new Error('Vous avez déjà postulé à cette offre.');
    }

    return applicationRepository.create({ candidateId, offerId, coverLetter });
  }

  async getMyApplications(candidateId: string) {
    return applicationRepository.findByCandidate(candidateId);
  }

  async getOfferApplications(offerId: string) {
    return applicationRepository.findByOffer(offerId);
  }

  async getRecruiterApplications(recruiterId: string, offerId?: string) {
    return applicationRepository.findByRecruiter(recruiterId, offerId);
  }

  async updateStatus(id: string, status: string) {
    return applicationRepository.updateStatus(id, status as any);
  }
}

export const applicationService = new ApplicationService();
