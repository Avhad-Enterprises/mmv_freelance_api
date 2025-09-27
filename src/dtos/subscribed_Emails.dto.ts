// subscribed_emails.dto.ts

import { IsEmail } from 'class-validator';

export class SubscribedEmailDTO {
  @IsEmail()
  email: string;

}
