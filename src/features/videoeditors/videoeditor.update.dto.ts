// Video Editor Update DTO - For updating video editor-specific fields
import { IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

/**
 * DTO for updating video editor-specific profile information
 * Extends the base freelancer update DTO
 * Currently minimal as most fields are in freelancer_profiles
 */
export class VideoEditorUpdateDto {
  // Video editor-specific fields can be added here as needed
  // Currently videoeditor_profiles table has minimal specific fields
  
  // Example future fields:
  // @IsOptional()
  // @IsArray()
  // software_proficiency?: string[];
  
  // @IsOptional()
  // @IsArray()
  // editing_styles?: string[];
  
  // @IsOptional()
  // @IsBoolean()
  // color_grading_expert?: boolean;
  
  // @IsOptional()
  // @IsArray()
  // specialty_types?: string[];

  // For now, we use the FreelancerUpdateDto for all common fields
  // This DTO exists for future extensibility
}
