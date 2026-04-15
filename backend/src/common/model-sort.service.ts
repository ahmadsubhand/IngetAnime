import { Injectable } from '@nestjs/common';
import { AnimePlatformResponse } from '../types/entity';

interface AnimePlatform {
  id: AnimePlatformResponse['id'];
  isMainPlatform: AnimePlatformResponse['isMainPlatform'];
  platformId: AnimePlatformResponse['platformId'];
}

@Injectable()
export class ModelSortService {
  animePlatformsBasedOnUserSelectedPlatform(
    animePlatformA: AnimePlatform,
    animePlatformB: AnimePlatform,
    animePlatformId: number | null,
  ): number {
    if (
      animePlatformId &&
      (animePlatformA.id === animePlatformId ||
        animePlatformB.id === animePlatformId)
    ) {
      return (
        Number(animePlatformB.id === animePlatformId) -
        Number(animePlatformA.id === animePlatformId)
      );
    } else return 0;
  }
}
