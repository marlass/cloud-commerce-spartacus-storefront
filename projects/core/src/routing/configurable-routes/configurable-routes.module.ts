import { CommonModule } from '@angular/common';
import { NgModule, APP_INITIALIZER } from '@angular/core';
import { ConfigurableRoutesService } from './configurable-routes.service';
import { RoutesConfigLoader } from './routes-config-loader';
import { ConfigModule, Config } from '../../config/config.module';
import { PathService } from './path/path.service';
import { DynamicPathService } from './path/dynamic-path.service';
import {
  defaultConfigurableRoutesConfig,
  ConfigurableRoutesConfig
} from './configurable-routes-config';

export function loadRoutesConfig(loader: RoutesConfigLoader) {
  const result = () => loader.load(); // workaround for AOT compilation (see https://stackoverflow.com/a/51977115)
  return result;
}

@NgModule({
  imports: [
    CommonModule,
    ConfigModule.withConfig(defaultConfigurableRoutesConfig)
  ],
  declarations: [],
  exports: [],
  providers: [
    ConfigurableRoutesService,
    RoutesConfigLoader,
    PathService,
    DynamicPathService,
    {
      provide: APP_INITIALIZER,
      useFactory: loadRoutesConfig,
      deps: [RoutesConfigLoader],
      multi: true
    },
    { provide: ConfigurableRoutesConfig, useExisting: Config }
  ]
})
export class ConfigurableRoutesModule {}
