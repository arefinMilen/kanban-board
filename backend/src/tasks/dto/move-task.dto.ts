import { IsInt, IsNotEmpty, IsUUID, Min } from 'class-validator';

export class MoveTaskDto {
  @IsUUID('4', { message: 'targetColumnId must be a valid UUID' })
  @IsNotEmpty({ message: 'targetColumnId is required' })
  targetColumnId!: string;

  @IsInt({ message: 'targetIndex must be an integer' })
  @Min(0, { message: 'targetIndex cannot be negative' })
  targetIndex!: number;
}
