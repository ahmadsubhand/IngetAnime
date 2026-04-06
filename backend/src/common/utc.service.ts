import { Injectable } from '@nestjs/common';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

@Injectable()
export class UtcService {
  dateToISOString(date?: Date | string | null): string | null {
    return date ? dayjs.utc(date).toISOString() : null;
  }

  ISOStringToYYYMMDD(date?: Date | string | null): string | null {
    return date ? dayjs.utc(date).format('YYYY-MM-DD') : null;
  }
}
