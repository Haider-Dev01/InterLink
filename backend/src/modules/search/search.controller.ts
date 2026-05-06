import { Request, Response, NextFunction } from 'express';
import { Role } from '../../generated/prisma';
import { prisma } from '../../shared/config/prismaClient';
import { toPublicAssetUrl } from '../../shared/utils/assetUrl';

type SearchType = 'all' | 'users' | 'jobs' | 'companies';

type RankedItem<TType extends 'user' | 'job' | 'company', TPayload> = {
  type: TType;
  score: number;
  updatedAt: Date;
  payload: TPayload;
};

const ROLE_PRIORITY: Record<Role, number> = {
  candidate: 12,
  recruiter: 8,
  admin: 0,
};

function normalizeType(value: string | undefined): SearchType {
  const normalized = (value ?? 'all').toLowerCase();
  if (normalized === 'users' || normalized === 'jobs' || normalized === 'companies') {
    return normalized;
  }
  return 'all';
}

function parseLimit(rawValue: string | undefined) {
  const parsed = Number(rawValue);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 8;
  }
  return Math.min(Math.round(parsed), 20);
}

function relevanceScore(target: string, query: string): number {
  const normalizedTarget = target.toLowerCase().trim();
  const normalizedQuery = query.toLowerCase().trim();

  if (!normalizedTarget || !normalizedQuery) {
    return 0;
  }

  if (normalizedTarget === normalizedQuery) {
    return 100;
  }

  if (normalizedTarget.startsWith(normalizedQuery)) {
    return 80;
  }

  if (normalizedTarget.includes(` ${normalizedQuery}`)) {
    return 60;
  }

  if (normalizedTarget.includes(normalizedQuery)) {
    return 40;
  }

  return 0;
}

function agePenalty(date: Date): number {
  const daysAgo = (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24);
  return Math.min(daysAgo * 0.03, 5);
}

export const searchController = {
  async globalSearch(req: Request, res: Response, next: NextFunction) {
    try {
      const query = ((req.query.query as string) || (req.query.q as string) || '').trim();
      const type = normalizeType(req.query.type as string | undefined);
      const perTypeLimit = parseLimit(req.query.limit as string | undefined);

      if (query.length < 2) {
        return res.status(200).json({
          success: true,
          data: {
            query,
            type,
            users: [],
            jobs: [],
            companies: [],
            results: [],
          },
        });
      }

      const shouldFetchUsers = type === 'all' || type === 'users';
      const shouldFetchJobs = type === 'all' || type === 'jobs';
      const shouldFetchCompanies = type === 'all' || type === 'companies';

      const [users, jobs, companies] = await Promise.all([
        shouldFetchUsers
          ? prisma.user.findMany({
              where: {
                role: {
                  in: ['candidate', 'recruiter'],
                },
                deletedAt: null,
                OR: [
                  { profile: { firstName: { contains: query, mode: 'insensitive' } } },
                  { profile: { lastName: { contains: query, mode: 'insensitive' } } },
                  { email: { contains: query, mode: 'insensitive' } },
                ],
              },
              select: {
                id: true,
                email: true,
                role: true,
                createdAt: true,
                profile: {
                  select: {
                    firstName: true,
                    lastName: true,
                    avatarUrl: true,
                  },
                },
              },
              orderBy: { createdAt: 'desc' },
              take: perTypeLimit * 2,
            })
          : Promise.resolve([]),
        shouldFetchJobs
          ? prisma.jobOffer.findMany({
              where: {
                offerStatus: 'published',
                deletedAt: null,
                OR: [
                  { title: { contains: query, mode: 'insensitive' } },
                  { description: { contains: query, mode: 'insensitive' } },
                  { location: { contains: query, mode: 'insensitive' } },
                  { company: { name: { contains: query, mode: 'insensitive' } } },
                ],
              },
              select: {
                id: true, title: true, description: true, location: true,
                durationMonths: true, remote: true, offerStatus: true,
                publishedAt: true, createdAt: true, updatedAt: true,
                company: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
              orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
              take: perTypeLimit * 2,
            })
          : Promise.resolve([]),
        shouldFetchCompanies
          ? prisma.company.findMany({
              where: {
                deletedAt: null,
                OR: [
                  { name: { contains: query, mode: 'insensitive' } },
                  { industry: { contains: query, mode: 'insensitive' } },
                ],
              },
              select: {
                id: true,
                name: true,
                industry: true,
                isVerified: true,
                createdAt: true,
              },
              orderBy: { createdAt: 'desc' },
              take: perTypeLimit * 2,
            })
          : Promise.resolve([]),
      ]);

      const rankedUsers: RankedItem<
        'user',
        {
          id: string;
          firstName: string;
          lastName: string;
          email: string;
          role: Role;
          profileImage: string | null;
        }
      >[] = users.map((user) => {
        const firstName = user.profile?.firstName ?? '';
        const lastName = user.profile?.lastName ?? '';
        const fullName = `${firstName} ${lastName}`.trim();
        const base = Math.max(
          relevanceScore(fullName, query),
          relevanceScore(firstName, query),
          relevanceScore(lastName, query),
          relevanceScore(user.email, query),
        );
        const score = base + ROLE_PRIORITY[user.role] - agePenalty(user.createdAt);

        return {
          type: 'user',
          score,
          updatedAt: user.createdAt,
          payload: {
            id: user.id,
            firstName,
            lastName,
            email: user.email,
            role: user.role,
            profileImage: toPublicAssetUrl(req, user.profile?.avatarUrl) ?? null,
          },
        };
      });

      const rankedJobs: RankedItem<
        'job',
        {
          id: string;
          title: string;
          location: string | null;
          publishedAt: Date | null;
          company: {
            id: string;
            name: string;
          };
        }
      >[] = jobs.map((job) => {
        const companyName = job.company?.name ?? '';
        const base = Math.max(
          relevanceScore(job.title, query),
          relevanceScore(companyName, query),
          relevanceScore(job.description, query),
          relevanceScore(job.location ?? '', query),
        );
        const freshnessDate = job.publishedAt ?? job.createdAt;
        const score = base + 6 - agePenalty(freshnessDate);

        return {
          type: 'job',
          score,
          updatedAt: freshnessDate,
          payload: {
            id: job.id,
            title: job.title,
            location: job.location,
            publishedAt: job.publishedAt,
            company: {
              id: job.company.id,
              name: companyName,
            },
          },
        };
      });

      const rankedCompanies: RankedItem<
        'company',
        {
          id: string;
          name: string;
          industry: string | null;
          isVerified: boolean;
        }
      >[] = companies.map((company) => {
        const base = Math.max(
          relevanceScore(company.name, query),
          relevanceScore(company.industry ?? '', query),
        );
        const score = base + (company.isVerified ? 4 : 0) - agePenalty(company.createdAt);

        return {
          type: 'company',
          score,
          updatedAt: company.createdAt,
          payload: {
            id: company.id,
            name: company.name,
            industry: company.industry,
            isVerified: company.isVerified,
          },
        };
      });

      const usersResult = rankedUsers
        .sort((a, b) => (b.score - a.score) || (b.updatedAt.getTime() - a.updatedAt.getTime()))
        .slice(0, perTypeLimit)
        .map((item) => item.payload);

      const jobsResult = rankedJobs
        .sort((a, b) => (b.score - a.score) || (b.updatedAt.getTime() - a.updatedAt.getTime()))
        .slice(0, perTypeLimit)
        .map((item) => item.payload);

      const companiesResult = rankedCompanies
        .sort((a, b) => (b.score - a.score) || (b.updatedAt.getTime() - a.updatedAt.getTime()))
        .slice(0, perTypeLimit)
        .map((item) => item.payload);

      const mergedResults = [...rankedUsers, ...rankedJobs, ...rankedCompanies]
        .sort((a, b) => (b.score - a.score) || (b.updatedAt.getTime() - a.updatedAt.getTime()))
        .slice(0, perTypeLimit * 3)
        .map((item) => ({
          type: item.type,
          score: Math.round(item.score * 100) / 100,
          ...item.payload,
        }));

      return res.status(200).json({
        success: true,
        data: {
          query,
          type,
          users: usersResult,
          jobs: jobsResult,
          companies: companiesResult,
          results: mergedResults,
        },
      });
    } catch (error) {
      next(error);
    }
  },
};
