export interface User {
  id: string
  email: string
  role: 'candidate' | 'recruiter' | 'admin'
  isVerified: boolean
  isBanned: boolean
  location: string | null
  availabilityMonths: number | null
  createdAt: string
  profile: Profile | null
}

export interface Profile {
  id: string
  userId: string
  firstName: string
  lastName: string
  bio: string | null
  linkedinUrl: string | null
  githubUsername: string | null
  companyId: string | null
}

export interface AuthResponse {
  success: boolean
  data: {
    accessToken: string
    user: User
  }
  message: string
}
