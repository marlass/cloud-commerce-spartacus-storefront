import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import {
  AuthService,
  CmsService,
  PageType,
  ProtectedRoutesService,
  RoutingService,
  SemanticPathService,
} from '@spartacus/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * Guards the _logout_ route.
 *
 * Takes care of routing the user to a logout page (if available) or redirects to
 * the homepage. If the homepage is protected, the user is redirected
 * to the login route instead.
 */
@Injectable({
  providedIn: 'root',
})
export class LogoutGuard implements CanActivate {
  constructor(
    protected auth: AuthService,
    protected cms: CmsService,
    protected routing: RoutingService,
    protected semanticPathService: SemanticPathService,
    protected protectedRoutes: ProtectedRoutesService
  ) {}

  canActivate(): Observable<any> {
    this.logout();

    return this.cms
      .hasPage({
        id: this.semanticPathService.get('logout'),
        type: PageType.CONTENT_PAGE,
      })
      .pipe(
        tap((hasPage) => {
          if (!hasPage) {
            this.redirect();
          }
        })
      );
  }

  /**
   * Whenever there is no specific "logout" page configured in the CMS,
   * we redirect after the user is logged out.
   *
   * The user gets redirected to the homepage, unless the homepage is protected
   * (in case of a closed shop). We'll redirect to the login page instead.
   */
  protected redirect(): void {
    const cxRoute = this.protectedRoutes.shouldProtect ? 'login' : 'home';
    this.routing.go({ cxRoute });
  }

  /**
   * Log user out.
   *
   * This is delegated to the `AuthService`.
   */
  protected logout(): void {
    this.auth.logout();
  }
}
