/* eslint-disable no-undef */
/* eslint-disable consistent-return */
describe('Selectable List', () => {
  // ignore chrome ResizeObserver error
  // Cypress.on('uncaught:exception', e => {
  //   if (e.message.includes('ResizeObserver loop limit exceeded')) return false;
  // });

  it('Open playground', () => {
    cy.visit('http://localhost:8000/demo/demo.html');
  });

  it('Check sorting selectable list', () => {
    cy.get('vaadin-tabs > vaadin-tab').then(items => {
      cy.wrap(items[1]).click().wait(3000).should('have.attr', 'selected');
    });
    // click on Age to sort
    cy.get('mist-list#playground')
      .find('vaadin-grid')
      .find('#sorter-column-Age')
      .click();

    cy.get('mist-list#playground')
      .find('vaadin-grid')
      .find('vaadin-grid-cell-content[slot="vaadin-grid-cell-content-32"]')
      .contains('18');
  });

  it('Check total items', () => {
    cy.get('mist-list#playground').then($el => {
      const el = $el.get()[0];
      const count = el.count;
      expect(count).equal(30);
    });
  });

  it('Select 3 entries', () => {
    cy.get('mist-list#playground')
      .find('vaadin-grid')
      .find('vaadin-grid-cell-content[slot="vaadin-grid-cell-content-28"]')
      .find('.item-check')
      .click({ force: true });

    cy.get('mist-list#playground')
      .find('vaadin-grid')
      .find('vaadin-grid-cell-content[slot="vaadin-grid-cell-content-38"]')
      .find('.item-check')
      .click({ force: true });

    cy.get('mist-list#playground')
      .find('vaadin-grid')
      .find('vaadin-grid-cell-content[slot="vaadin-grid-cell-content-48"]')
      .find('mist-check')
      .click({ force: true });

    cy.get('mist-list#playground')
      .find('vaadin-grid')
      .find('vaadin-grid-cell-content[slot="vaadin-grid-cell-content-25"]')
      .find('#actions')
      .find('mist-check')
      .should('have.text', '3');
  });
});
