import { HttpClientModule } from '@angular/common/http';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CONSENT_TEMPLATE_NORMALIZER } from '../../../user/index';
import { ConverterService } from '../../../util/index';
import { OccEndpointsService } from '../../services';
import { OccAnonymousConsentTemplatesAdapter } from './occ-anonymous-consent-templates.adapter';
import { MockOccEndpointsService } from './unit-test.helper';

describe('OccAnonymousConsentTemplatesAdapter', () => {
  let httpMock: HttpTestingController;
  let converter: ConverterService;
  let occEnpointsService: OccEndpointsService;
  let adapter: OccAnonymousConsentTemplatesAdapter;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule, HttpClientTestingModule],
      providers: [
        OccAnonymousConsentTemplatesAdapter,
        {
          provide: OccEndpointsService,
          useClass: MockOccEndpointsService,
        },
      ],
    });

    httpMock = TestBed.get(HttpTestingController as Type<
      HttpTestingController
    >);
    converter = TestBed.get(ConverterService as Type<ConverterService>);
    occEnpointsService = TestBed.get(OccEndpointsService as Type<
      OccEndpointsService
    >);
    adapter = TestBed.get(OccAnonymousConsentTemplatesAdapter as Type<
      OccAnonymousConsentTemplatesAdapter
    >);
    spyOn(converter, 'pipeableMany').and.callThrough();
    spyOn(occEnpointsService, 'getUrl').and.callThrough();
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('loadAnonymousConsentTemplates', () => {
    it('should load anonymous consent templates', () => {
      adapter
        .loadAnonymousConsentTemplates()
        .subscribe()
        .unsubscribe();
      httpMock.expectOne(req => {
        return req.method === 'GET';
      });
      expect(occEnpointsService.getUrl).toHaveBeenCalledWith(
        'anonymousConsentTemplates'
      );
      expect(converter.pipeableMany).toHaveBeenCalledWith(
        CONSENT_TEMPLATE_NORMALIZER
      );
    });
  });
});
