import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiPagination } from '../types';

@Injectable()
export class ModelPaginationService {
  constructor(private config: ConfigService) {}

  getServerPageLink(
    endpoint: string,
    prevLink?: string,
    nextLink?: string,
  ): ApiPagination {
    const port = this.config.get<number>('PORT', 3000);
    const baseUrl = this.config.get<string>('BASE_URL', 'http://localhost');

    let prev: string | null = null;
    let next: string | null = null;
    if (prevLink) {
      const queryLink = prevLink.split('?')[1];
      prev = `${baseUrl}:${port}${endpoint}?${queryLink}`;
    }
    if (nextLink) {
      const queryLink = nextLink.split('?')[1];
      next = `${baseUrl}:${port}${endpoint}?${queryLink}`;
    }

    if (prev || next) {
      return {
        paging: { prev, next },
      };
    }
    return { paging: null };
  }
}
