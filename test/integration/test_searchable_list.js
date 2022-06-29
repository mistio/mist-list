/* eslint-disable no-undef */
/* eslint-disable consistent-return */
describe('Searchable List', () => {
  // ignore chrome ResizeObserver error
  // Cypress.on('uncaught:exception', e => {
  //   if (e.message.includes('ResizeObserver loop limit exceeded')) return false;
  // });

  it('Open playground', () => {
    cy.visit('http://localhost:8000/demo/demo.html');
  });

  it('Check sorting searchable list', () => {
    cy.get('vaadin-tabs > vaadin-tab').then(items => {
      cy.wrap(items[2]).click().wait(3000).should('have.attr', 'selected');
    });
    // click on Age to sort
    cy.get('mist-list#playground')
      .find('vaadin-grid')
      .find('#sorter-column-Age')
      .click();

    cy.get('mist-list#playground')
      .find('vaadin-grid')
      .find('vaadin-grid-cell-content[slot="vaadin-grid-cell-content-28"]')
      .contains('18');
  });

  it('Check total items', () => {
    cy.get('mist-list#playground').then($el => {
      const el = $el.get()[0];
      const count = el.count;
      expect(count).equal(30);
    });
  });

  it('Search for emi', () => {
    cy.get('mist-list#playground')
      .find('app-toolbar')
      .find('mist-filter')
      .find('h2.titleh2')
      .click();

    cy.wait(2000);
    cy.get('mist-list#playground')
      .find('app-toolbar')
      .find('mist-filter')
      .find('#searchInput')
      .find('input')
      .type('emi');

    cy.get('mist-list#playground')
      .find('vaadin-grid')
      .find('vaadin-grid-cell-content[slot="vaadin-grid-cell-content-25"]')
      .contains('Emily');
  });
});
