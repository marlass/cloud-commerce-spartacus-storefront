import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { ConsignmentTracking } from '../../../model/consignment-tracking.model';
import { makeErrorSerializable } from '../../../util/serialization-utils';
import { UserOrderConnector } from '../../connectors/order/user-order.connector';
import { UserActions } from '../actions/index';

@Injectable()
export class ConsignmentTrackingEffects {
  @Effect()
  loadConsignmentTracking$: Observable<
    UserActions.ConsignmentTrackingAction
  > = this.actions$.pipe(
    ofType(UserActions.LOAD_CONSIGNMENT_TRACKING),
    map((action: UserActions.LoadConsignmentTracking) => action.payload),
    switchMap((payload) => {
      return this.userOrderConnector
        .getConsignmentTracking(
          payload.orderCode,
          payload.consignmentCode,
          payload.userId
        )
        .pipe(
          map(
            (tracking: ConsignmentTracking) =>
              new UserActions.LoadConsignmentTrackingSuccess(tracking)
          ),
          catchError((error) =>
            of(
              new UserActions.LoadConsignmentTrackingFail(
                makeErrorSerializable(error)
              )
            )
          )
        );
    })
  );

  constructor(
    private actions$: Actions,
    private userOrderConnector: UserOrderConnector
  ) {}
}
