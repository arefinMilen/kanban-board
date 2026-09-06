import { IsEmail, IsEnum, IsNotEmpty } from 'class-validator';
import { Role } from '@prisma/client';

export class AddMemberDto {
  @IsEmail({}, { message: 'Invalid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email!: string;

  @IsEnum(Role, { message: 'Role must be OWNER, EDITOR, or VIEWER' })
  @IsNotEmpty({ message: 'Role is required' })
  role!: Role;
}
