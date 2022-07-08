import { LitElement, html, css } from 'lit';
import { repeat } from 'lit/directives/repeat.js';
import '@vaadin/grid/vaadin-grid.js';
import '@vaadin/grid/vaadin-grid-column.js';
import '@vaadin/grid/vaadin-grid-tree-column.js';

export default class MistList extends LitElement {
  static get styles() {
    return css``;
  }

  static get properties() {
    return {
      dataProvider: {
        type: Object,
      },
      items: {
        type: Array,
      },
      itemMap: {
        type: Object,
      },
      frozenColumns: {
        type: Array,
      },
      visibleColumns: {
        type: Array,
      },
    };
  }

  render() {
    return html`
      <vaadin-grid .items="${this.items} all-rows-visible">
        ${this.columnsTemplate()}
      </vaadin-grid>
    `;
  }

  constructor() {
    super();
    this.dataProvider = null;
    this.items = [];
    this.itemMap = {};
    this.frozenColumns = [];
    this.visibleColumns = [];
  }

  // observed changes

  updated(updatedProperties) {
    // update items when itemMap changes
    if (updatedProperties.has('itemMap')) {
      const newItems = Object.values(this.itemMap);
      this.items = newItems;
    }
  }

  columnsTemplate() {
    // add tree view later!!!
    let frozenRenderer = html``;
    let visibleRenderer = html``;
    if (this.frozenColumns.length > 0) {
      frozenRenderer = html`
        ${repeat(
          this.frozenColumns,
          column => column,
          column => html`
            <vaadin-grid-column frozen path="${column}, resizable">
            </vaadin-grid-column>
          `
        )}
      `;
    }
    if (this.visibleColumns.length > 0) {
      visibleRenderer = html`
        ${repeat(
          this.visibleColumns,
          column => column,
          column => html`
                        <vaadin-grid-column path="${column}, resizable>
                        </vaadin-grid-column>
                    `
        )}
      `;
    }
    return html` ${frozenRenderer} ${visibleRenderer} `;
  }
}

customElements.define('mist-list-lit', MistList);
