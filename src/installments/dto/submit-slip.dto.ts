import { IsString, IsNotEmpty, IsUrl } from 'class-validator';

export class SubmitSlipDto {
  @IsString()
  @IsNotEmpty()
  @IsUrl()
  slipUrl: string;
}
