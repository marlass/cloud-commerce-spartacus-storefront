import { Injectable } from '@angular/core';
import { Config } from '@spartacus/core';

@Injectable({
  providedIn: 'root',
  useExisting: Config,
})
export abstract class ViewConfig {
  view?: {
    /**
     * Configurations related to the view of the application
     */
    infiniteScroll?: {
      active?: boolean;
      productLimit?: number;
      showMoreButton?: boolean;
    };
  };
}
