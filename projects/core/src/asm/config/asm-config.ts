import { OccConfig } from '../../occ/config/occ-config';
import { Injectable } from '@angular/core';
import { Config } from '../../config/config.module';

@Injectable({
  providedIn: 'root',
  useExisting: Config,
})
export abstract class AsmConfig extends OccConfig {
  asm?: {
    agentSessionTimer?: {
      startingDelayInSeconds?: number;
    };
    customerSearch?: {
      maxResults?: number;
    };
  };
}
