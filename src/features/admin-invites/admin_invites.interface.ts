// src/features/admin-invites/admin_invites.interface.ts

export interface IAdminInvite {
    invitation_id: number;
    first_name: string;
    last_name: string;
    email: string;
    invite_token: string;
    status: 'pending' | 'accepted' | 'revoked' | 'expired';
    assigned_role: string | null;
    password: string | null;
    invited_by: number;
    expires_at: string; // or `Date` depending on your usage
    accepted_at: string | null; // or `Date`
    created_at: string; // or `Date`
    updated_at: string; // or `Date`
    is_deleted: boolean;
}
  