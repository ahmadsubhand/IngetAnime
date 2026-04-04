import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiResponse, PlatformResponse } from '../types';
import type { PlatformId, PlatformName } from './platform.validator';
import { PlatformValidation } from './platform.validator';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { PlatformService } from './platform.service';
import { AuthGuard } from '../auth/guard/auth.guard';
import { Role } from '../auth/decorator/role.decarator';
import { SkipThrottle } from '@nestjs/throttler';

@Controller()
export class PlatformController {
  constructor(private service: PlatformService) {}

  @Post('platform')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard)
  @Role('admin')
  async createPlatform(
    @Body(new ZodValidationPipe(PlatformValidation.PLATFORM_NAME))
    data: PlatformName,
  ): Promise<ApiResponse<PlatformResponse>> {
    const platform = await this.service.createPlatform(data);
    return {
      message: 'Create platform successfully',
      data: platform,
      statusCode: HttpStatus.CREATED,
    };
  }

  @SkipThrottle()
  @Get('/platform/:id')
  @HttpCode(HttpStatus.OK)
  async getPlatformDetail(
    @Param(new ZodValidationPipe(PlatformValidation.PLATFORM_ID))
    data: PlatformId,
  ): Promise<ApiResponse<PlatformResponse>> {
    const platform = await this.service.getPlatformDetail(data.id);
    return {
      message: 'Get platform detail successfully',
      data: platform,
      statusCode: HttpStatus.OK,
    };
  }

  @Put('/platform/:id')
  @UseGuards(AuthGuard)
  @Role('admin')
  @HttpCode(HttpStatus.OK)
  async updatePlatform(
    @Param(new ZodValidationPipe(PlatformValidation.PLATFORM_ID))
    param: PlatformId,
    @Body(new ZodValidationPipe(PlatformValidation.PLATFORM_NAME))
    data: PlatformName,
  ): Promise<ApiResponse<PlatformResponse>> {
    const platform = await this.service.updatePlatform(param.id, data);
    return {
      message: 'Update platform successfully',
      data: platform,
      statusCode: HttpStatus.OK,
    };
  }

  @Delete('/platform/:id')
  @UseGuards(AuthGuard)
  @Role('admin')
  @HttpCode(HttpStatus.OK)
  async deletePlatform(
    @Param(new ZodValidationPipe(PlatformValidation.PLATFORM_ID))
    data: PlatformId,
  ): Promise<ApiResponse<PlatformResponse>> {
    const platform = await this.service.deletePlatform(data.id);
    return {
      message: 'Delete platform successfully',
      data: platform,
      statusCode: HttpStatus.OK,
    };
  }
}
