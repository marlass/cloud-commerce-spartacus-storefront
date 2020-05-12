import { verifyTabbingOrder } from '../../tabbing-order';
import { TabElement } from '../../tabbing-order.model';

const containerSelector = '.StoreFinderPageTemplate';

export function storesListTabbingOrder(config: TabElement[]) {
  cy.visit('/store-finder/country/JP');

  cy.server();

  cy.route(
    'GET',
    `${Cypress.env('OCC_PREFIX')}/${Cypress.env('BASE_SITE')}/stores?fields=*`
  ).as('storesList');

  cy.wait('@storesList');

  verifyTabbingOrder(containerSelector, config);
}
