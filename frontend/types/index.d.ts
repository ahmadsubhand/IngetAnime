import { HttpStatusCode } from 'axios';
import { $ZodIssue } from 'zod/v4/core';

export interface ApiResponse<T> {
  message: string;
  data: T;
  statusCode: HttpStatusCode;
}

export interface ApiExpectedError {
  message: string;
  error: string;
  statusCode: HttpStatusCode;
}

export interface ApiValidationError {
  message: string;
  error: $ZodIssue[];
  statusCode: HttpStatusCode;
}

export type ApiPagination = {
  paging: {
    prev: string | null;
    next: string | null;
  } | null;
};