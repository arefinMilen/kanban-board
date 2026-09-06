import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateBoardDto {
  @IsString()
  @IsNotEmpty({ message: 'Board name cannot be empty' })
  name!: string;
}
