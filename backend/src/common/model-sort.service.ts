import { Injectable } from '@nestjs/common';

interface AnimePlatform {
  id: number;
  isMainPlatform: boolean;
  platformId: number;
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
