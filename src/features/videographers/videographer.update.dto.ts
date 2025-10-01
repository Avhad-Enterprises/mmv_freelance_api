// Videographer Update DTO - For updating videographer-specific fields
import { IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

/**
 * DTO for updating videographer-specific profile information
 * Extends the base freelancer update DTO
 * Currently minimal as most fields are in freelancer_profiles
 */
export class VideographerUpdateDto {
  // Videographer-specific fields can be added here as needed
  // Currently videographer_profiles table has minimal specific fields
  
  // Example future fields:
  // @IsOptional()
  // @IsArray()
  // camera_equipment?: string[];
  
  // @IsOptional()
  // @IsBoolean()
  // drone_certified?: boolean;
  
  // @IsOptional()
  // @IsArray()
  // shooting_styles?: string[];

  // For now, we use the FreelancerUpdateDto for all common fields
  // This DTO exists for future extensibility
}
