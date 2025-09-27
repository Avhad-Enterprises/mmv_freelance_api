// interfaces/invite.interface.ts

export interface IAdminInvite {
    id: number;
    fullname: string;
    email: string;
    invite_token: string | null;
    role: string | null;
    is_used: boolean;
    invited_by: number | null;
    expires_at: string; // or `Date` depending on your usage
    created_at: string; // or `Date`
    used_at: string | null;
     password : any

  }
  