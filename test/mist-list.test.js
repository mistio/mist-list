import { html, fixture, expect } from '@open-wc/testing';

import '../mist-list.js';

describe('MistList', () => {
  it('should render an items list', async () => {
    const el = await fixture(html`
      <mist-list></mist-list>
    `);

    el.items = [
      { first_name: 'John', last_name: 'Smith', position: 'Obergruppenführer' },
      { first_name: 'Juliana', last_name: 'Crain' },
      { first_name: 'Frank', last_name: 'Frink' },
      { first_name: 'Joe', last_name: 'Blake', position: 'SS Agent' },
      { first_name: 'Robert', last_name: 'Childan' },
      { first_name: 'Takeshi', last_name: 'Kido', position: 'Inspector' },
    ];
    el.visible = ['first_name', 'last_name'];
    expect(el.shadowRoot.textContent.indexOf('Obergruppenführer')).to.equal(-1);
    // expect(el.shadowRoot.textContent.indexOf('Smith')).to.greaterThan(-1);
    el.visible = ['first_name', 'last_name', 'position'];
    expect(el.shadowRoot.textContent.indexOf('Obergruppenführer')).to.greaterThan(-1);
  });
});
