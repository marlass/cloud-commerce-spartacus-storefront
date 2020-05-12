import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { AsmAdapter } from '../../../asm/connectors/asm.adapter';
import { provideDefaultConfig } from '../../../config/config.module';
import { defaultOccAsmConfig } from './default-occ-asm-config';
import { OccAsmAdapter } from './occ-asm.adapter';

@NgModule({
  imports: [CommonModule, HttpClientModule],
  providers: [
    provideDefaultConfig(defaultOccAsmConfig),
    {
      provide: AsmAdapter,
      useClass: OccAsmAdapter,
    },
  ],
})
export class AsmOccModule {}
