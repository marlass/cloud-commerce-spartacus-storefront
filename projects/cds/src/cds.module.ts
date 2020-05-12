import { ModuleWithProviders, NgModule } from '@angular/core';
import {
  provideConfig,
  provideConfigValidator,
  provideDefaultConfig,
} from '@spartacus/core';
import {
  CdsConfig,
  cdsConfigValidator,
  DEFAULT_CDS_CONFIG,
} from './config/index';
import { MerchandisingModule } from './merchandising/merchandising.module';
import { ProfileTagModule } from './profiletag/profile-tag.module';

@NgModule({
  imports: [ProfileTagModule, MerchandisingModule.forRoot()],
})
export class CdsModule {
  static forRoot(config: CdsConfig): ModuleWithProviders<CdsModule> {
    return {
      ngModule: CdsModule,
      providers: [
        provideDefaultConfig(DEFAULT_CDS_CONFIG),
        provideConfig(config),
        provideConfigValidator(cdsConfigValidator),
      ],
    };
  }
}
