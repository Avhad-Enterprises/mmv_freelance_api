import {
    IsString, IsNotEmpty, IsInt, IsArray, IsOptional, IsBoolean
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRoleDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsOptional()
    @IsString()
    label?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsBoolean()
    is_active?: boolean;
}

export class UpdateRoleDto extends CreateRoleDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    role_id: number;
}

export class CreatePermissionDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsOptional()
    @IsString()
    label?: string;

    @IsOptional()
    @IsString()
    module?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsBoolean()
    is_critical?: boolean;
}

export class UpdatePermissionDto extends CreatePermissionDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    permission_id: number;
}

export class BulkAssignPermissionDto {
    @IsArray()
    @IsInt({ each: true })
    permission_ids: number[];
}
