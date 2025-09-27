export interface IReview {
  id: number;             // Primary key
  project_id: number;     // Associated project
  client_id: number;      // Reviewer (client)
  user_id: number;        // Reviewee (freelancer)
  rating: number;         // Rating out of 5
  review: string;         // Review content

  is_deleted?: boolean;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}
