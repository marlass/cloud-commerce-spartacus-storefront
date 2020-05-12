import { doPlaceOrder, orderHistoryTest } from '../../../helpers/order-history';
import { product } from '../../../sample-data/checkout-flow';
import { formats } from '../../../sample-data/viewports';
import { waitForOrderWithConsignmentToBePlacedRequest } from '../../../support/utils/order-placed';

describe(`${
  formats.mobile.width + 1
}p resolution - Order History with orders`, () => {
  before(() => {
    cy.window().then((win) => win.sessionStorage.clear());
    cy.requireLoggedIn();
  });

  beforeEach(() => {
    cy.restoreLocalStorage();
    cy.viewport(formats.mobile.width, formats.mobile.height);
  });

  afterEach(() => {
    cy.saveLocalStorage();
  });

  orderHistoryTest.checkIfOrderIsDisplayed();
  orderHistoryTest.checkSortingByCode();
  orderHistoryTest.checkCorrectDateFormat(true);
});

describe(`${formats.mobile.width + 1}p resolution - Order details page`, () => {
  before(() => {
    cy.window().then((win) => win.sessionStorage.clear());
    cy.requireLoggedIn();
  });

  beforeEach(() => {
    cy.viewport(formats.mobile.width, formats.mobile.height);
  });

  it('should display order details page', () => {
    doPlaceOrder().then((orderData: any) => {
      cy.waitForOrderToBePlacedRequest(
        undefined,
        undefined,
        orderData.body.code
      );
      cy.visit('/my-account/orders');
      cy.get('.cx-order-history-code > .cx-order-history-value')
        .then((el) => {
          const orderNumber = el.text().match(/\d+/)[0];
          waitForOrderWithConsignmentToBePlacedRequest(orderNumber);
          return cy.wrap(el);
        })
        .first()
        .click();
      cy.get('.cx-item-list-row .cx-link').should('contain', product.name);
      cy.get('.cx-item-list-row .cx-code').should('contain', product.code);
      cy.get('.cx-summary-total > .cx-summary-amount').should(
        'contain',
        orderData.body.totalPrice.formattedValue
      );
    });
  });
});
