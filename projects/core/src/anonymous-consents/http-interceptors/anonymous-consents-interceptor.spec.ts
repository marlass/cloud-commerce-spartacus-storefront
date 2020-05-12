import {
  HTTP_INTERCEPTORS,
  HttpClient,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { inject, TestBed } from '@angular/core/testing';
import { Observable, of } from 'rxjs';
import { AuthService } from '../../auth/index';
import { ANONYMOUS_CONSENT_STATUS, AnonymousConsent } from '../../model/index';
import { OccEndpointsService } from '../../occ/index';
import { AnonymousConsentsConfig } from '../config/anonymous-consents-config';
import { AnonymousConsentsService } from '../facade/index';
import {
  ANONYMOUS_CONSENTS_HEADER,
  AnonymousConsentsInterceptor,
} from './anonymous-consents-interceptor';

const mockAnonymousConsents: AnonymousConsent[] = [
  { templateCode: 'MARKETING', version: 0, consentState: null },
  { templateCode: 'PERSONALIZATION', version: 0, consentState: null },
];

class MockOccEndpointsService {
  getBaseEndpoint(): string {
    return '';
  }
}

class MockAuthService {
  isUserLoggedIn(): Observable<boolean> {
    return of();
  }
}

class MockAnonymousConsentsService {
  getConsents(): Observable<AnonymousConsent[]> {
    return of();
  }
  setConsents(_consents: AnonymousConsent[]): void {}
  serializeAndEncode(_consents: AnonymousConsent[]): string {
    return '';
  }
  decodeAndDeserialize(_rawConsents: string): AnonymousConsent[] {
    return [];
  }
  consentsUpdated(
    _newConsents: AnonymousConsent[],
    _previousConsents: AnonymousConsent[]
  ): boolean {
    return false;
  }
}

const mockAnonymousConsentsConfig = {
  anonymousConsents: {
    requiredConsents: ['OTHER_CONSENT'],
  },
  features: {
    anonymousConsents: true,
  },
};

describe('AnonymousConsentsInterceptor', () => {
  let httpMock: HttpTestingController;
  let anonymousConsentsService: AnonymousConsentsService;
  let authService: AuthService;
  let interceptor: AnonymousConsentsInterceptor;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        {
          provide: AnonymousConsentsService,
          useClass: MockAnonymousConsentsService,
        },
        { provide: AuthService, useClass: MockAuthService },
        { provide: OccEndpointsService, useClass: MockOccEndpointsService },
        {
          provide: HTTP_INTERCEPTORS,
          useClass: AnonymousConsentsInterceptor,
          multi: true,
        },
        {
          provide: AnonymousConsentsConfig,
          useValue: mockAnonymousConsentsConfig,
        },
      ],
    });
    httpMock = TestBed.inject(HttpTestingController);
    anonymousConsentsService = TestBed.inject(AnonymousConsentsService);
    authService = TestBed.inject(AuthService);

    const interceptors = TestBed.inject(HTTP_INTERCEPTORS);
    interceptors.forEach((i: HttpInterceptor) => {
      if (i instanceof AnonymousConsentsInterceptor) {
        interceptor = i;
      }
    });

    spyOn<any>(interceptor, 'isOccUrl').and.returnValue(true);
  });

  const handleRequestMethod = 'handleRequest';
  const giveRequiredConsentsMethod = 'giveRequiredConsents';
  const handleResponseMethod = 'handleResponse';

  describe('handleRequestMethod', () => {
    it('should return the provided request if the consents are falsy', () => {
      spyOn(anonymousConsentsService, 'serializeAndEncode').and.stub();

      const request = new HttpRequest('GET', 'xxx');
      const result = interceptor[handleRequestMethod](null, request);
      expect(
        anonymousConsentsService.serializeAndEncode
      ).not.toHaveBeenCalled();
      expect(result).toEqual(request);
    });

    it('should call serializeAndEncode and add the consents to the headers', () => {
      const mockHeaderValue = 'dummy headers';
      spyOn(anonymousConsentsService, 'serializeAndEncode').and.returnValue(
        mockHeaderValue
      );

      const request = new HttpRequest('GET', 'xxx');
      const result = interceptor[handleRequestMethod](
        mockAnonymousConsents,
        request
      );
      expect(anonymousConsentsService.serializeAndEncode).toHaveBeenCalledWith(
        mockAnonymousConsents
      );
      expect(result).toEqual(
        request.clone({
          setHeaders: {
            [ANONYMOUS_CONSENTS_HEADER]: mockHeaderValue,
          },
        })
      );
    });
  });

  describe(handleResponseMethod, () => {
    describe('when newRawConsents are falsy', () => {
      it('should NOT call decodeAndDeserialize and giveRequiredConsents', () => {
        spyOn(anonymousConsentsService, 'decodeAndDeserialize').and.stub();
        spyOn<any>(interceptor, giveRequiredConsentsMethod).and.stub();

        interceptor[handleResponseMethod](true, null, []);

        expect(
          anonymousConsentsService.decodeAndDeserialize
        ).not.toHaveBeenCalled();
        expect(interceptor[giveRequiredConsentsMethod]).not.toHaveBeenCalled();
      });
    });

    describe('when rawCosents are NOT falsy', () => {
      describe('and user is logged in', () => {
        it('should NOT call decodeAndDeserialize and giveRequiredConsents', () => {
          spyOn(anonymousConsentsService, 'decodeAndDeserialize').and.stub();
          spyOn<any>(interceptor, giveRequiredConsentsMethod).and.stub();

          interceptor[handleResponseMethod](true, 'dummy headers', []);

          expect(
            anonymousConsentsService.decodeAndDeserialize
          ).not.toHaveBeenCalled();
          expect(
            interceptor[giveRequiredConsentsMethod]
          ).not.toHaveBeenCalled();
        });
      });
      describe('and user is NOT logged in', () => {
        it('should call consentsUpdated', () => {
          const mockHeaderValue = 'dummy headers';
          spyOn(anonymousConsentsService, 'decodeAndDeserialize').and.stub();
          spyOn<any>(interceptor, giveRequiredConsentsMethod).and.returnValue(
            mockAnonymousConsents
          );
          spyOn(anonymousConsentsService, 'consentsUpdated').and.returnValue(
            false
          );

          interceptor[handleResponseMethod](
            false,
            mockHeaderValue,
            mockAnonymousConsents
          );

          expect(
            anonymousConsentsService.decodeAndDeserialize
          ).toHaveBeenCalledWith(mockHeaderValue);
          expect(anonymousConsentsService.consentsUpdated).toHaveBeenCalledWith(
            mockAnonymousConsents,
            mockAnonymousConsents
          );
        });
      });
      describe('when the consentsUpdated returns true', () => {
        it('should call anonymousConsentsService.setConsents()', () => {
          const mockHeaderValue = 'dummy headers';
          spyOn(anonymousConsentsService, 'decodeAndDeserialize').and.stub();
          spyOn<any>(interceptor, giveRequiredConsentsMethod).and.returnValue(
            mockAnonymousConsents
          );
          spyOn(anonymousConsentsService, 'consentsUpdated').and.returnValue(
            true
          );
          spyOn(anonymousConsentsService, 'setConsents').and.stub();

          interceptor[handleResponseMethod](
            false,
            mockHeaderValue,
            mockAnonymousConsents
          );

          expect(
            anonymousConsentsService.decodeAndDeserialize
          ).toHaveBeenCalledWith(mockHeaderValue);
          expect(anonymousConsentsService.consentsUpdated).toHaveBeenCalledWith(
            mockAnonymousConsents,
            mockAnonymousConsents
          );
          expect(anonymousConsentsService.setConsents).toHaveBeenCalledWith(
            mockAnonymousConsents
          );
        });
      });
    });
  });

  describe(`${giveRequiredConsentsMethod}`, () => {
    it('should giveAnonymousConsent', () => {
      const consents: AnonymousConsent[] = [
        { templateCode: 'MARKETING', version: 0, consentState: null },
        { templateCode: 'OTHER_CONSENT', version: 0, consentState: null },
      ];
      const expectedConsents: AnonymousConsent[] = [
        { templateCode: 'MARKETING', version: 0, consentState: null },
        {
          templateCode: 'OTHER_CONSENT',
          version: 0,
          consentState: ANONYMOUS_CONSENT_STATUS.GIVEN,
        },
      ];

      const result = interceptor[giveRequiredConsentsMethod]([...consents]);
      expect(result).toEqual(expectedConsents);
    });
  });

  describe('intercept', () => {
    afterEach(() => {
      httpMock.verify();
    });

    describe('when sending a request', () => {
      it(`should call ${handleRequestMethod}`, inject(
        [HttpClient],
        (http: HttpClient) => {
          spyOn(anonymousConsentsService, 'getConsents').and.returnValue(
            of(mockAnonymousConsents)
          );
          spyOn(authService, 'isUserLoggedIn').and.returnValue(of(false));
          spyOn<any>(interceptor, handleRequestMethod).and.callThrough();

          http
            .get('/xxx')
            .subscribe((result) => {
              expect(result).toBeTruthy();
            })
            .unsubscribe();

          httpMock.expectOne((req) => {
            return req.method === 'GET';
          });
          expect(interceptor[handleRequestMethod]).toHaveBeenCalled();
        }
      ));
    });
  });
});
