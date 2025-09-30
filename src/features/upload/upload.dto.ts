import { IsString, IsNotEmpty } from 'class-validator';

export class uploadtoawsDto {
    @IsString()
    @IsNotEmpty()
    public filename: string;

    @IsString()
    @IsNotEmpty()
    public base64String: string;
}