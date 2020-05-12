import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import {
  CheckoutService,
  Order,
  PromotionResult,
  PromotionLocation,
} from '@spartacus/core';
import { Observable } from 'rxjs';
import { PromotionService } from '../../../../shared/services/promotion/promotion.service';

@Component({
  selector: 'cx-order-confirmation-items',
  templateUrl: './order-confirmation-items.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderConfirmationItemsComponent implements OnInit, OnDestroy {
  promotionLocation: PromotionLocation = PromotionLocation.Checkout;
  order$: Observable<Order>;
  orderPromotions$: Observable<PromotionResult[]>;

  constructor(
    protected checkoutService: CheckoutService,
    protected promotionService: PromotionService
  ) {}

  ngOnInit() {
    this.order$ = this.checkoutService.getOrderDetails();
    this.orderPromotions$ = this.promotionService.getOrderPromotions(
      this.promotionLocation
    );
  }

  ngOnDestroy() {
    this.checkoutService.clearCheckoutData();
  }
}
