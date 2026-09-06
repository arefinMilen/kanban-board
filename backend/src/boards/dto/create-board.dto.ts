import { IsNotEmpty, IsString } from 'class-validator';

export class CreateBoardDto {
  @IsString()
  @IsNotEmpty({ message: 'Board name is required' })
  name!: string;
}
