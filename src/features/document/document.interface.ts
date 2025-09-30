export interface IDocument {
  document_id: number;                       
  user_id: number;                          
  document_type:
    | 'aadhaar'
    | 'passport'
    | 'driver_license'
    | 'voter_id'
    | 'pan_card'
    | 'utility_bill';
  document_upload: string;                     
  status: 'pending' | 'verified' | 'rejected';
  verified_by?: number | null;
  verified_at?: Date | null;
  rejection_reason?: string | null;
  created_at: Date;
  updated_at: Date;
}