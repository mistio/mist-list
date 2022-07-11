import { LitElement, html, css, render } from 'lit';
import { repeat } from 'lit/directives/repeat.js';
import '@vaadin/grid/vaadin-grid.js';
// import '@vaadin/grid/vaadin-grid-column.js';
import '@vaadin/grid/vaadin-grid-sort-column.js';
import '@vaadin/grid/vaadin-grid-tree-column.js';
import '@vaadin/icons';
import {createDataProvider} from './list_data_provider_gen.js';

/* eslint-disable class-methods-use-this */
export class MistList extends LitElement {
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
      frozenColumns: {
        type: Array,
      },
      visibleColumns: {
        type: Array,
      },
      itemsURL: {
        type: String
      },
      itemsPath: {
        type: Array
      },
      actions: {
        type: Array
      }
    };
  }

  render() {
    return html`
      <vaadin-grid .dataProvider="${this.dataProvider}" all-rows-visible>
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
    this.itemsURL = "";
    this.actions = [];
    this.itemsPath = null;
  }

  updated(changedProperties) {
    // Load data provider if itemsURL is given or changed
    if (changedProperties.has('itemsURL')) {
      if (this.itemsURL) {
        this.dataProvider = createDataProvider(this.itemsURL, this.itemsPath);
      }
    }

  }

  // eslint-disable no-invalid-html
  columnsTemplate() {
    // add tree view later!!!
    let frozenTemplate = html``;
    let visibleTemplate = html``;
    let actionsTemplate = html``;
    if (this.frozenColumns.length > 0) {
      frozenTemplate = html`
        ${repeat(
          this.frozenColumns,
          column => column,
          column => html`
            <vaadin-grid-sort-column frozen path="${column}" resizable>
            </vaadin-grid-sort-column>
          `
        )}
      `;
    }
    if (this.visibleColumns.length > 0) {
      visibleTemplate = html`
        ${repeat(
          this.visibleColumns,
          column => column,
          column => html`
            <vaadin-grid-sort-column path="${column}" resizable>
            </vaadin-grid-sort-column>
          `
        )}
      `;
    }

    if (this.actions.length > 1) {
      actionsTemplate = html`
        <vaadin-grid-column frozen-to-end header="Actions" .renderer="${this.actionsRenderer}" auto-width">
        </vaadin-grid-column>
      `;
    }
    return html` ${frozenTemplate} ${visibleTemplate} ${actionsTemplate} `;
  }

  actionsRenderer(root, __, _model) {
    render(html`
      <style>
        vaadin-icon {
          transform: scale(0.7);
        }
      </style>
      <vaadin-icon icon="vaadin:ellipsis-dots-v"></vaadin-icon>
    `, root);
  }
}
