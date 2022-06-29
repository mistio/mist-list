/* eslint-disable no-undef */
/* eslint-disable consistent-return */
describe('Simple List', () => {
  // ignore chrome ResizeObserver error
  // Cypress.on('uncaught:exception', e => {
  //   if (e.message.includes('ResizeObserver loop limit exceeded')) return false;
  // });

  it('Open playground', () => {
    cy.visit('http://localhost:8000/demo/demo.html');
  });

  it('Check sorting simple list', () => {
    cy.get('vaadin-tabs > vaadin-tab').then(items => {
      cy.wrap(items[0]).should('have.attr', 'selected');
    });

    // click on Age to sort
    cy.get('#playground')
      .find('vaadin-grid')
      .find('#sorter-column-Age')
      .click();

    cy.get('#playground')
      .find('vaadin-grid')
      .find('vaadin-grid-cell-content[slot="vaadin-grid-cell-content-28"]')
      .find('div')
      .should('have.text', '18');
  });

  it('Check total items', () => {
    cy.get('#playground').then($el => {
      const el = $el.get()[1];
      const count = el.count;
      expect(count).equal(30);
    });
  });
});
