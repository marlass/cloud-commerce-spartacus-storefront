import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { OccEndpointsService } from '../../../occ/services/occ-endpoints.service';
import { AuthConfig } from '../../config/auth-config';
import { ClientToken } from '../../models/token-types.model';

@Injectable()
export class ClientAuthenticationTokenService {
  constructor(
    protected config: AuthConfig,
    protected http: HttpClient,
    protected occEndpointsService: OccEndpointsService
  ) {}

  loadClientAuthenticationToken(): Observable<ClientToken> {
    const url: string = this.occEndpointsService.getRawEndpoint('login');
    const params = new HttpParams()
      .set(
        'client_id',
        encodeURIComponent(this.config.authentication.client_id)
      )
      .set(
        'client_secret',
        encodeURIComponent(this.config.authentication.client_secret)
      )
      .set('grant_type', 'client_credentials');

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });
    return this.http.post<ClientToken>(url, params, { headers });
  }
}
