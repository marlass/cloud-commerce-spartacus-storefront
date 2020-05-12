import { standardUser } from '../sample-data/shared-users';
import { login } from './auth-forms';
import * as alerts from './global-message';
import { generateMail, randomString } from './user';

export const CLOSE_ACCOUNT = '/my-account/close-account';

export function registerAndLogin() {
  standardUser.registrationData.email = generateMail(randomString(), true);
  cy.requireLoggedIn(standardUser);
}
export function accessPageAsAnonymous() {
  cy.visit(CLOSE_ACCOUNT);
  cy.location('pathname').should('contain', '/login');
}

export function cancelCloseAccountAction() {
  cy.get('cx-close-account a').click({ force: true });
  cy.location('pathname').should('contain', '/');
}

export function closeAccount() {
  cy.server();
  cy.route(
    'DELETE',
    `${Cypress.env('OCC_PREFIX')}/${Cypress.env('BASE_SITE')}/users/*`
  ).as('deleteQuery');

  cy.location('pathname').should('contain', CLOSE_ACCOUNT);

  cy.get('cx-close-account button').click({ force: true });

  cy.get('cx-close-account-modal .cx-btn-group button:first-of-type').click();

  cy.wait('@deleteQuery').its('status').should('eq', 200);

  cy.location('pathname').should('contain', '/');

  alerts.getSuccessAlert().should('contain', 'Account closed with success');
}

export function verifyAccountClosed() {
  cy.visit('/login');
  login(
    standardUser.registrationData.email,
    standardUser.registrationData.password
  );

  cy.location('pathname').should('contain', '/login');
  alerts.getErrorAlert().should('contain', 'User is disabled');
}

export function verifyAsAnonymous() {
  it('should redirect to login page for anonymous user', () => {
    accessPageAsAnonymous();
  });
}

export function closeAccountTest() {
  it('should be able to cancel and go back to home', () => {
    cancelCloseAccountAction();
  });

  it('should be able to close account', () => {
    closeAccount();
  });
}

export function verifyAccountClosedTest() {
  it('should not be able to login with a closed account', () => {
    verifyAccountClosed();
  });
}
