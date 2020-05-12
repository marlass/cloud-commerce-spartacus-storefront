import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import {
  ActiveCartService,
  RoutesConfig,
  RoutingConfigService,
} from '@spartacus/core';
import { CheckoutConfigService, CheckoutStepType } from '@spartacus/storefront';
import { BehaviorSubject } from 'rxjs';
import { defaultStorefrontRoutesConfig } from '../../../cms-structure/routing/default-routing-config';
import { ExpressCheckoutService } from '../services/express-checkout.service';
import { CheckoutGuard } from './checkout.guard';

const isExpressCheckoutSet = new BehaviorSubject(false);
const setDefaultCheckoutDetailsSuccess = new BehaviorSubject(false);
const MockRoutesConfig: RoutesConfig = defaultStorefrontRoutesConfig;

class MockCheckoutConfigService {
  isExpressCheckout() {
    return isExpressCheckoutSet;
  }
  getFirstCheckoutStepRoute() {
    return 'checkoutShippingAddress';
  }
  getCheckoutStepRoute() {
    return 'checkoutReviewOrder';
  }
}

class MockExpressCheckoutService {
  trySetDefaultCheckoutDetails() {
    return setDefaultCheckoutDetailsSuccess;
  }
}

class MockRoutingConfigService {
  getRouteConfig(routeName: string) {
    return MockRoutesConfig[routeName];
  }
}

class MockCartService {
  isGuestCart() {
    return false;
  }
}

describe(`CheckoutGuard`, () => {
  let guard: CheckoutGuard;
  let mockRoutingConfigService: RoutingConfigService;
  let mockCheckoutConfigService: CheckoutConfigService;
  let cartService: ActiveCartService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: CheckoutConfigService, useClass: MockCheckoutConfigService },
        { provide: RoutingConfigService, useClass: MockRoutingConfigService },
        { provide: ActiveCartService, useClass: MockCartService },
        {
          provide: ExpressCheckoutService,
          useClass: MockExpressCheckoutService,
        },
      ],
      imports: [RouterTestingModule],
    });

    guard = TestBed.inject(CheckoutGuard);
    mockRoutingConfigService = TestBed.inject(RoutingConfigService);
    mockCheckoutConfigService = TestBed.inject(CheckoutConfigService);
    cartService = TestBed.inject(ActiveCartService);
  });

  it(`should redirect to first checkout step if express checkout is turned off`, (done) => {
    isExpressCheckoutSet.next(false);
    guard
      .canActivate()
      .subscribe((result) => {
        expect(result.toString()).toEqual(
          `/${
            mockRoutingConfigService.getRouteConfig(
              mockCheckoutConfigService.getFirstCheckoutStepRoute()
            ).paths[0]
          }`
        );
        done();
      })
      .unsubscribe();
  });

  it(`should redirect to first checkout step if is guest checkout`, (done) => {
    isExpressCheckoutSet.next(true);
    spyOn(cartService, 'isGuestCart').and.returnValue(true);

    guard
      .canActivate()
      .subscribe((result) => {
        expect(result.toString()).toEqual(
          `/${
            mockRoutingConfigService.getRouteConfig(
              mockCheckoutConfigService.getFirstCheckoutStepRoute()
            ).paths[0]
          }`
        );
        done();
      })
      .unsubscribe();
  });

  it(`should redirect to first checkout step if express checkout is not possible`, (done) => {
    isExpressCheckoutSet.next(true);
    setDefaultCheckoutDetailsSuccess.next(false);
    guard
      .canActivate()
      .subscribe((result) => {
        expect(result.toString()).toEqual(
          `/${
            mockRoutingConfigService.getRouteConfig(
              mockCheckoutConfigService.getFirstCheckoutStepRoute()
            ).paths[0]
          }`
        );
        done();
      })
      .unsubscribe();
  });

  it(`should redirect to review order`, (done) => {
    isExpressCheckoutSet.next(true);
    setDefaultCheckoutDetailsSuccess.next(true);
    guard
      .canActivate()
      .subscribe((result) => {
        expect(result.toString()).toEqual(
          `/${
            mockRoutingConfigService.getRouteConfig(
              mockCheckoutConfigService.getCheckoutStepRoute(
                CheckoutStepType.REVIEW_ORDER
              )
            ).paths[0]
          }`
        );
        done();
      })
      .unsubscribe();
  });
});
