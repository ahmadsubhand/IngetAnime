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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiResponse } from '../../types';
import { Platform } from './platform.model';
import type { PlatformId, PlatformName } from './platform.validation';
import { PlatformValidation } from './platform.validation';
import { ZodValidationPipe } from '../../common/zod-validation.pipe';
import { PlatformService } from './platform.service';
import { VerifiedAuthGuard } from '../auth/guard/auth.guard';
import { Role } from '../auth/decorator/role.decarator';
import { SkipThrottle } from '@nestjs/throttler';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller()
export class PlatformController {
  constructor(private service: PlatformService) {}

  @Post('platform')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(VerifiedAuthGuard)
  @Role('admin')
  @UseInterceptors(FileInterceptor('icon'))
  async createPlatform(
    @Body(new ZodValidationPipe(PlatformValidation.PLATFORM_NAME))
    data: PlatformName,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<ApiResponse<Platform>> {
    const platform = await this.service.createPlatform(data, file);
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
  ): Promise<ApiResponse<Platform>> {
    const platform = await this.service.getPlatformDetail(data.id);
    return {
      message: 'Get platform detail successfully',
      data: platform,
      statusCode: HttpStatus.OK,
    };
  }

  @Put('/platform/:id')
  @UseGuards(VerifiedAuthGuard)
  @Role('admin')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('icon'))
  async updatePlatform(
    @Param(new ZodValidationPipe(PlatformValidation.PLATFORM_ID))
    param: PlatformId,
    @Body(new ZodValidationPipe(PlatformValidation.PLATFORM_NAME))
    data: PlatformName,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<ApiResponse<Platform>> {
    const platform = await this.service.updatePlatform(param.id, data, file);
    return {
      message: 'Update platform successfully',
      data: platform,
      statusCode: HttpStatus.OK,
    };
  }

  @Delete('/platform/:id')
  @UseGuards(VerifiedAuthGuard)
  @Role('admin')
  @HttpCode(HttpStatus.OK)
  async deletePlatform(
    @Param(new ZodValidationPipe(PlatformValidation.PLATFORM_ID))
    data: PlatformId,
  ): Promise<ApiResponse<{ id: number; name: string }>> {
    const platform = await this.service.deletePlatform(data.id);
    return {
      message: 'Delete platform successfully',
      data: platform,
      statusCode: HttpStatus.OK,
    };
  }
}
