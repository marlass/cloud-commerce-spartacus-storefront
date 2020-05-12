import { ModuleWithProviders, NgModule } from '@angular/core';
import { provideDefaultConfig } from '../config/config.module';
import { defaultI18nConfig } from './config/default-i18n-config';
import { CxDatePipe } from './date.pipe';
import { i18nextProviders } from './i18next/i18next-providers';
import { I18nextTranslationService } from './i18next/i18next-translation.service';
import { TranslatePipe } from './translate.pipe';
import { TranslationChunkService } from './translation-chunk.service';
import { TranslationService } from './translation.service';

@NgModule({
  declarations: [TranslatePipe, CxDatePipe],
  exports: [TranslatePipe, CxDatePipe],
})
export class I18nModule {
  static forRoot(): ModuleWithProviders<I18nModule> {
    return {
      ngModule: I18nModule,
      providers: [
        provideDefaultConfig(defaultI18nConfig),
        { provide: TranslationService, useExisting: I18nextTranslationService },
        TranslationChunkService,
        ...i18nextProviders,
      ],
    };
  }
}
