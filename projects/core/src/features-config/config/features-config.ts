import { Injectable } from '@angular/core';
import { Config } from '../../config/config.module';

@Injectable({
  providedIn: 'root',
  useExisting: Config,
})
export abstract class FeaturesConfig {
  features?: {
    [featureToggle: string]: string | boolean;
  };
}
