import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { IsIn, IsNumber, IsOptional, IsString } from 'class-validator';
import { OnboardingRole } from './knowledge';
import { AssistantService } from './assistant.service';

class ChatDto {
  @IsIn(['cliente', 'vendedor', 'admin']) role!: OnboardingRole;
  @IsString() message!: string;
  @IsOptional() @IsNumber() stepIndex?: number;
  @IsOptional() @IsString() context?: string;
  @IsOptional() history?: { role: 'user' | 'assistant'; content: string }[];
}

@Controller('assistant')
export class AssistantController {
  constructor(private svc: AssistantService) {}

  @Get('status')
  status() {
    return this.svc.status();
  }

  @Get('onboarding')
  onboarding(@Query('role') role: OnboardingRole = 'cliente', @Query('step') step?: string) {
    return this.svc.getOnboarding(role, step ? Number(step) : 0);
  }

  @Post('chat')
  chat(@Body() dto: ChatDto) {
    return this.svc.chat(dto);
  }
}
