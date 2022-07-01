/* eslint-disable no-undef */
/* eslint-disable consistent-return */
describe('Tree View List', () => {
  // ignore chrome ResizeObserver error
  // Cypress.on('uncaught:exception', e => {
  //   if (e.message.includes('ResizeObserver loop limit exceeded')) return false;
  // });

  it('Open playground', () => {
    cy.visit('http://localhost:8000/demo/demo.html');
  });

  it('Check sorting tree view list', () => {
    cy.get('vaadin-tabs > vaadin-tab').then(items => {
      cy.wrap(items[3]).click().wait(3000).should('have.attr', 'selected');
    });
    // click on Age to sort
    cy.get('mist-list#playground')
      .find('vaadin-grid')
      .find('#sorter-column-id')
      .click()
      .wait(300)
      .click();

    cy.get('mist-list#playground')
      .find('vaadin-grid')
      .find('vaadin-grid-cell-content[slot="vaadin-grid-cell-content-29"]')
      .contains('019');
  });

  it('Expand tree view', () => {
    cy.get('mist-list#playground')
      .find('vaadin-grid')
      .find('vaadin-grid-cell-content[slot="vaadin-grid-cell-content-44"]')
      .find('vaadin-grid-tree-toggle')
      .click();

    cy.get('mist-list#playground')
      .find('vaadin-grid')
      .find('vaadin-grid-cell-content[slot="vaadin-grid-cell-content-48"]')
      .find('vaadin-grid-tree-toggle')
      .should('have.attr', 'style', '---level:1;');

    cy.get('mist-list#playground')
      .find('vaadin-grid')
      .find('vaadin-grid-cell-content[slot="vaadin-grid-cell-content-48"]')
      .find('div')
      .contains('AA7-2');
  });
});
