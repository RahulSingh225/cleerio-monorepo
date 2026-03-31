export interface AuthenticatedUser {
  userId: string;
  email: string;
  role: string;
  tenantId?: string;
  isPlatformUser: boolean;
}
