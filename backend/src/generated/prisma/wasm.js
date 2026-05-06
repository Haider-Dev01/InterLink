
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: "5.22.0",
  engine: "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  email: 'email',
  passwordHash: 'passwordHash',
  role: 'role',
  isVerified: 'isVerified',
  isBanned: 'isBanned',
  companyId: 'companyId',
  location: 'location',
  availabilityMonths: 'availabilityMonths',
  createdAt: 'createdAt',
  deletedAt: 'deletedAt'
};

exports.Prisma.BookmarkScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  offerId: 'offerId',
  createdAt: 'createdAt'
};

exports.Prisma.RefreshTokenScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  tokenHash: 'tokenHash',
  expiresAt: 'expiresAt',
  revokedAt: 'revokedAt',
  createdAt: 'createdAt'
};

exports.Prisma.ProfileScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  companyId: 'companyId',
  schoolId: 'schoolId',
  firstName: 'firstName',
  lastName: 'lastName',
  bio: 'bio',
  avatarUrl: 'avatarUrl',
  viewsCount: 'viewsCount',
  linkedinUrl: 'linkedinUrl',
  githubUsername: 'githubUsername',
  githubData: 'githubData',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CompanyScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  name: 'name',
  industry: 'industry',
  siteWeb: 'siteWeb',
  isVerified: 'isVerified',
  isRejected: 'isRejected',
  rejectedReason: 'rejectedReason',
  validatedAt: 'validatedAt',
  createdAt: 'createdAt',
  deletedAt: 'deletedAt'
};

exports.Prisma.SchoolScalarFieldEnum = {
  id: 'id',
  name: 'name',
  country: 'country',
  createdAt: 'createdAt'
};

exports.Prisma.SkillScalarFieldEnum = {
  id: 'id',
  name: 'name',
  category: 'category',
  createdAt: 'createdAt'
};

exports.Prisma.CvDocumentScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  fileUrl: 'fileUrl',
  isActive: 'isActive',
  importedFrom: 'importedFrom',
  parseStatus: 'parseStatus',
  parsedText: 'parsedText',
  retryCount: 'retryCount',
  lastAttemptAt: 'lastAttemptAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ExtractedSkillScalarFieldEnum = {
  id: 'id',
  cvDocumentId: 'cvDocumentId',
  skillId: 'skillId',
  confidence: 'confidence'
};

exports.Prisma.JobOfferScalarFieldEnum = {
  id: 'id',
  companyId: 'companyId',
  recruiterId: 'recruiterId',
  title: 'title',
  description: 'description',
  location: 'location',
  durationMonths: 'durationMonths',
  remote: 'remote',
  offerStatus: 'offerStatus',
  viewCount: 'viewCount',
  publishedAt: 'publishedAt',
  expiresAt: 'expiresAt',
  isFeatured: 'isFeatured',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  deletedAt: 'deletedAt'
};

exports.Prisma.OfferSkillScalarFieldEnum = {
  offerId: 'offerId',
  skillId: 'skillId',
  isRequired: 'isRequired'
};

exports.Prisma.MatchScoreScalarFieldEnum = {
  id: 'id',
  candidateId: 'candidateId',
  offerId: 'offerId',
  cvDocumentId: 'cvDocumentId',
  scoreCosinus: 'scoreCosinus',
  scoreFinal: 'scoreFinal',
  breakdown: 'breakdown',
  computedAt: 'computedAt'
};

exports.Prisma.ApplicationScalarFieldEnum = {
  id: 'id',
  candidateId: 'candidateId',
  offerId: 'offerId',
  applicationStatus: 'applicationStatus',
  coverLetter: 'coverLetter',
  appliedAt: 'appliedAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.MessageScalarFieldEnum = {
  id: 'id',
  senderId: 'senderId',
  receiverId: 'receiverId',
  applicationId: 'applicationId',
  content: 'content',
  isRead: 'isRead',
  createdAt: 'createdAt'
};

exports.Prisma.ConnectionScalarFieldEnum = {
  id: 'id',
  requesterId: 'requesterId',
  receiverId: 'receiverId',
  status: 'status',
  respondedAt: 'respondedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.NotificationScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  type: 'type',
  title: 'title',
  payload: 'payload',
  isRead: 'isRead',
  createdAt: 'createdAt'
};

exports.Prisma.AuditLogScalarFieldEnum = {
  id: 'id',
  actorId: 'actorId',
  action: 'action',
  entityType: 'entityType',
  entityId: 'entityId',
  metadata: 'metadata',
  createdAt: 'createdAt'
};

exports.Prisma.ChatMessageScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  role: 'role',
  content: 'content',
  context: 'context',
  createdAt: 'createdAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.NullableJsonNullValueInput = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull
};

exports.Prisma.JsonNullValueInput = {
  JsonNull: Prisma.JsonNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};
exports.Role = exports.$Enums.Role = {
  candidate: 'candidate',
  recruiter: 'recruiter',
  admin: 'admin'
};

exports.ImportedFrom = exports.$Enums.ImportedFrom = {
  upload: 'upload',
  json: 'json',
  github: 'github'
};

exports.ParseStatus = exports.$Enums.ParseStatus = {
  pending: 'pending',
  processing: 'processing',
  done: 'done',
  failed: 'failed'
};

exports.OfferStatus = exports.$Enums.OfferStatus = {
  draft: 'draft',
  published: 'published',
  archived: 'archived'
};

exports.ApplicationStatus = exports.$Enums.ApplicationStatus = {
  pending: 'pending',
  interview: 'interview',
  accepted: 'accepted',
  rejected: 'rejected',
  withdrawn: 'withdrawn'
};

exports.ConnectionStatus = exports.$Enums.ConnectionStatus = {
  pending: 'pending',
  accepted: 'accepted',
  rejected: 'rejected'
};

exports.Prisma.ModelName = {
  User: 'User',
  Bookmark: 'Bookmark',
  RefreshToken: 'RefreshToken',
  Profile: 'Profile',
  Company: 'Company',
  School: 'School',
  Skill: 'Skill',
  CvDocument: 'CvDocument',
  ExtractedSkill: 'ExtractedSkill',
  JobOffer: 'JobOffer',
  OfferSkill: 'OfferSkill',
  MatchScore: 'MatchScore',
  Application: 'Application',
  Message: 'Message',
  Connection: 'Connection',
  Notification: 'Notification',
  AuditLog: 'AuditLog',
  ChatMessage: 'ChatMessage'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
