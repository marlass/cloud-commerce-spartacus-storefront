import { Injectable } from '@angular/core';
import { merge, Observable } from 'rxjs';
import { filter, mapTo, switchMap, tap } from 'rxjs/operators';
import { CdsBackendConnector } from '../connectors/cds-backend-connector';
import {
  CartChangedPushEvent,
  ConsentChangedPushEvent,
  NavigatedPushEvent,
} from '../model/profile-tag.model';
import { ProfileTagEventService } from './profiletag-event.service';
import { SpartacusEventService } from './spartacus-event.service';

@Injectable({
  providedIn: 'root',
})
export class ProfileTagInjectorService {
  private profileTagEvents$ = this.profileTagEventTracker.getProfileTagEvents();
  private injectionsEvents$: Observable<boolean> = merge(
    this.notifyProfileTagOfConsentGranted(),
    this.notifyProfileTagOfCartChange(),
    this.notifyProfileTagOfPageLoaded(),
    this.notifyEcOfLoginSuccessful()
  );

  constructor(
    private profileTagEventTracker: ProfileTagEventService,
    private spartacusEventTracker: SpartacusEventService,
    private cdsBackendConnector: CdsBackendConnector
  ) {}

  track(): Observable<boolean> {
    return this.profileTagEventTracker.addTracker().pipe(
      switchMap(() => merge(this.injectionsEvents$, this.profileTagEvents$)),
      mapTo(true)
    );
  }

  private notifyProfileTagOfConsentGranted(): Observable<boolean> {
    return this.spartacusEventTracker.consentGranted().pipe(
      filter((granted) => Boolean(granted)),
      tap((granted) => {
        this.profileTagEventTracker.notifyProfileTagOfEventOccurence(
          new ConsentChangedPushEvent(granted)
        );
      })
    );
  }

  private notifyProfileTagOfCartChange(): Observable<boolean> {
    return this.spartacusEventTracker.cartChanged().pipe(
      tap((cart) => {
        this.profileTagEventTracker.notifyProfileTagOfEventOccurence(
          new CartChangedPushEvent(cart)
        );
      }),
      mapTo(true)
    );
  }

  private notifyProfileTagOfPageLoaded(): Observable<boolean> {
    return this.spartacusEventTracker.navigated().pipe(
      tap(() => {
        this.profileTagEventTracker.notifyProfileTagOfEventOccurence(
          new NavigatedPushEvent()
        );
      })
    );
  }

  private notifyEcOfLoginSuccessful(): Observable<boolean> {
    return this.spartacusEventTracker.loginSuccessful().pipe(
      switchMap((_) => {
        return this.cdsBackendConnector
          .notifySuccessfulLogin()
          .pipe(mapTo(true));
      })
    );
  }
}
