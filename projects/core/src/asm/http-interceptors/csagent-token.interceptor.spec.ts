import { HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import {
  HttpClientTestingModule,
  HttpTestingController,
  TestRequest,
} from '@angular/common/http/testing';
import { inject, TestBed } from '@angular/core/testing';
import { AsmAuthService, OccConfig } from '@spartacus/core';
import { Observable, of } from 'rxjs';
import { UserToken } from '../../auth/models/token-types.model';
import { defaultOccConfig } from '../../occ/config/default-occ-config';
import { InterceptorUtil } from '../../occ/utils/interceptor-util';
import { CustomerSupportAgentTokenInterceptor } from './csagent-token.interceptor';

const OccUrl = `https://localhost:9002${defaultOccConfig.backend.occ.prefix}electronics/test`;

const testToken = {
  access_token: 'xxx',
  token_type: 'bearer',
  refresh_token: 'xxx',
  expires_in: 1000,
  scope: ['xxx'],
  userId: 'xxx',
} as UserToken;

class MockAsmAuthService {
  getCustomerSupportAgentToken(): Observable<UserToken> {
    return of();
  }
}

const MockAuthModuleConfig: OccConfig = {
  backend: {
    occ: {
      baseUrl: 'https://localhost:9002',
      prefix: defaultOccConfig.backend.occ.prefix,
    },
  },
  context: {
    baseSite: ['electronics'],
  },
};

describe('CustomerSupportAgentTokenInterceptor', () => {
  let httpMock: HttpTestingController;
  let asmAuthService: AsmAuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: OccConfig, useValue: MockAuthModuleConfig },
        { provide: AsmAuthService, useClass: MockAsmAuthService },
        {
          provide: HTTP_INTERCEPTORS,
          useClass: CustomerSupportAgentTokenInterceptor,
          multi: true,
        },
      ],
    });
    httpMock = TestBed.inject(HttpTestingController);
    asmAuthService = TestBed.inject(AsmAuthService);
  });

  describe('Customer Support Agent Token Http Interceptor', () => {
    it('should not add the CSAgent token to the request by default', inject(
      [HttpClient],
      (http: HttpClient) => {
        spyOn(asmAuthService, 'getCustomerSupportAgentToken').and.returnValue(
          of(testToken)
        );

        http
          .get(OccUrl)
          .subscribe((result) => {
            expect(result).toBeTruthy();
          })
          .unsubscribe();

        const mockReq: TestRequest = httpMock.expectOne(OccUrl);

        const authHeader: string = mockReq.request.headers.get('Authorization');

        expect(authHeader).toBe(null);
      }
    ));

    it('should add the CSAgent token to the request when the appropriate header flag is present', inject(
      [HttpClient],
      (http: HttpClient) => {
        spyOn(asmAuthService, 'getCustomerSupportAgentToken').and.returnValue(
          of(testToken)
        );
        spyOn<any>(InterceptorUtil, 'getInterceptorParam').and.returnValue(
          true
        );
        http
          .get(OccUrl)
          .subscribe((result) => {
            expect(result).toBeTruthy();
          })
          .unsubscribe();

        const mockReq: TestRequest = httpMock.expectOne(OccUrl);
        const authHeader: string = mockReq.request.headers.get('Authorization');
        expect(authHeader).toBe(
          `${testToken.token_type} ${testToken.access_token}`
        );
      }
    ));
  });
});
