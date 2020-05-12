import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  ActiveCartService,
  Address,
  CheckoutDeliveryService,
  CheckoutPaymentService,
  CheckoutService,
  GlobalMessageService,
  GlobalMessageType,
  PaymentDetails,
  RoutingService,
  TranslationService,
  UserPaymentService,
} from '@spartacus/core';
import { combineLatest, Observable, of } from 'rxjs';
import { map, switchMap, take, tap } from 'rxjs/operators';
import { Card } from '../../../../shared/components/card/card.component';
import { ICON_TYPE } from '../../../misc/icon';
import { CheckoutConfigService } from '../../services/checkout-config.service';

@Component({
  selector: 'cx-payment-method',
  templateUrl: './payment-method.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentMethodComponent implements OnInit, OnDestroy {
  iconTypes = ICON_TYPE;
  existingPaymentMethods$: Observable<PaymentDetails[]>;
  isLoading$: Observable<boolean>;
  cards$: Observable<{ content: Card; paymentMethod: PaymentDetails }[]>;
  selectedMethod$: Observable<PaymentDetails>;
  isGuestCheckout = false;
  newPaymentFormManuallyOpened = false;

  protected shouldRedirect: boolean;
  protected deliveryAddress: Address;
  protected checkoutStepUrlNext: string;
  protected checkoutStepUrlPrevious: string;

  constructor(
    protected userPaymentService: UserPaymentService,
    protected checkoutService: CheckoutService,
    protected checkoutDeliveryService: CheckoutDeliveryService,
    protected checkoutPaymentService: CheckoutPaymentService,
    protected globalMessageService: GlobalMessageService,
    protected routingService: RoutingService,
    protected checkoutConfigService: CheckoutConfigService,
    protected activatedRoute: ActivatedRoute,
    protected translation: TranslationService,
    protected activeCartService: ActiveCartService
  ) {}

  ngOnInit() {
    this.shouldRedirect = false;
    this.isLoading$ = this.userPaymentService.getPaymentMethodsLoading();

    if (!this.activeCartService.isGuestCart()) {
      this.userPaymentService.loadPaymentMethods();
    } else {
      this.isGuestCheckout = true;
    }

    this.checkoutStepUrlNext = this.checkoutConfigService.getNextCheckoutStepUrl(
      this.activatedRoute
    );

    this.checkoutStepUrlPrevious = this.checkoutConfigService.getPreviousCheckoutStepUrl(
      this.activatedRoute
    );

    this.checkoutDeliveryService
      .getDeliveryAddress()
      .pipe(take(1))
      .subscribe((address: Address) => {
        this.deliveryAddress = address;
      });

    this.existingPaymentMethods$ = this.userPaymentService.getPaymentMethods();

    this.selectedMethod$ = this.checkoutPaymentService.getPaymentDetails().pipe(
      tap((paymentInfo) => {
        if (paymentInfo && !!Object.keys(paymentInfo).length) {
          if (paymentInfo['hasError']) {
            Object.keys(paymentInfo).forEach((key) => {
              if (key.startsWith('InvalidField')) {
                this.sendPaymentMethodFailGlobalMessage(paymentInfo[key]);
              }
            });
            this.checkoutService.clearCheckoutStep(3);
          } else if (this.shouldRedirect) {
            this.routingService.go(this.checkoutStepUrlNext);
          }
        }
      })
    );

    this.cards$ = combineLatest([
      this.existingPaymentMethods$.pipe(
        switchMap((methods) => {
          return !methods?.length
            ? of([])
            : combineLatest(
                methods.map((method) =>
                  combineLatest([
                    of(method),
                    this.translation.translate('paymentCard.expires', {
                      month: method.expiryMonth,
                      year: method.expiryYear,
                    }),
                  ]).pipe(
                    map(([payment, translation]) => ({
                      payment,
                      expiryTranslation: translation,
                    }))
                  )
                )
              );
        })
      ),
      this.selectedMethod$,
      this.translation.translate('paymentForm.useThisPayment'),
      this.translation.translate('paymentCard.defaultPaymentMethod'),
      this.translation.translate('paymentCard.selected'),
    ]).pipe(
      map(
        ([
          paymentMethods,
          selectedMethod,
          textUseThisPayment,
          textDefaultPaymentMethod,
          textSelected,
        ]) => {
          if (
            paymentMethods.length &&
            (!selectedMethod || Object.keys(selectedMethod).length === 0)
          ) {
            const defaultPaymentMethod = paymentMethods.find(
              (paymentMethod) => paymentMethod.payment.defaultPayment
            );
            if (defaultPaymentMethod) {
              selectedMethod = defaultPaymentMethod.payment;
              this.checkoutPaymentService.setPaymentDetails(selectedMethod);
            }
          }
          return paymentMethods.map((payment) => ({
            content: this.createCard(
              payment.payment,
              {
                textExpires: payment.expiryTranslation,
                textUseThisPayment,
                textDefaultPaymentMethod,
                textSelected,
              },
              selectedMethod
            ),
            paymentMethod: payment.payment,
          }));
        }
      )
    );
  }

  selectPaymentMethod(paymentDetails: PaymentDetails): void {
    this.checkoutPaymentService.setPaymentDetails(paymentDetails);
  }

  showNewPaymentForm(): void {
    this.newPaymentFormManuallyOpened = true;
  }

  hideNewPaymentForm(): void {
    this.newPaymentFormManuallyOpened = false;
  }

  setPaymentDetails({
    paymentDetails,
    billingAddress,
  }: {
    paymentDetails: PaymentDetails;
    billingAddress?: Address;
  }): void {
    const details: PaymentDetails = { ...paymentDetails };
    details.billingAddress = billingAddress || this.deliveryAddress;
    this.checkoutPaymentService.createPaymentDetails(details);
    this.shouldRedirect = true;
  }

  ngOnDestroy(): void {
    this.checkoutPaymentService.paymentProcessSuccess();
  }

  protected getCardIcon(code: string): string {
    let ccIcon: string;
    if (code === 'visa') {
      ccIcon = this.iconTypes.VISA;
    } else if (code === 'master' || code === 'mastercard_eurocard') {
      ccIcon = this.iconTypes.MASTER_CARD;
    } else if (code === 'diners') {
      ccIcon = this.iconTypes.DINERS_CLUB;
    } else if (code === 'amex') {
      ccIcon = this.iconTypes.AMEX;
    } else {
      ccIcon = this.iconTypes.CREDIT_CARD;
    }

    return ccIcon;
  }

  protected sendPaymentMethodFailGlobalMessage(field: string) {
    this.globalMessageService.add(
      {
        key: 'paymentMethods.invalidField',
        params: { field },
      },
      GlobalMessageType.MSG_TYPE_ERROR
    );
  }

  protected createCard(
    paymentDetails: PaymentDetails,
    cardLabels: {
      textDefaultPaymentMethod: string;
      textExpires: string;
      textUseThisPayment: string;
      textSelected: string;
    },
    selected: PaymentDetails
  ): Card {
    return {
      title: paymentDetails.defaultPayment
        ? cardLabels.textDefaultPaymentMethod
        : '',
      textBold: paymentDetails.accountHolderName,
      text: [paymentDetails.cardNumber, cardLabels.textExpires],
      img: this.getCardIcon(paymentDetails.cardType.code),
      actions: [{ name: cardLabels.textUseThisPayment, event: 'send' }],
      header:
        selected?.id === paymentDetails.id
          ? cardLabels.textSelected
          : undefined,
    };
  }

  goNext(): void {
    this.routingService.go(this.checkoutStepUrlNext);
  }

  goPrevious(): void {
    this.routingService.go(this.checkoutStepUrlPrevious);
  }
}
