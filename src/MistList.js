import { LitElement, html, css, render } from 'lit';
import { repeat } from 'lit/directives/repeat.js';
import '@vaadin/grid/vaadin-grid.js';
import {
  columnBodyRenderer,
  columnFooterRenderer,
  columnHeaderRenderer,
} from '@vaadin/grid/lit.js';
import "@vaadin/horizontal-layout";
import "@vaadin/text-field";
// import '@vaadin/grid/vaadin-grid-column.js';
import '@vaadin/grid/vaadin-grid-sort-column.js';
import '@vaadin/grid/vaadin-grid-tree-column.js';
import '@vaadin/icons';
import {createDataProvider} from './list_data_provider_gen.js';
import { debouncer } from "./utils.js";

/* eslint-disable class-methods-use-this */
export class MistList extends LitElement {
  static get styles() {
    return css`
      vaadin-grid {
        height: 100%;
      }

      #header {
        height: 50px;
        background-color: white;
        align-items: center;
      }
      #searchIcon {
        color: black;
      }
    `;
  }

  static get properties() {
    return {
      dataProvider: {
        type: Object,
      },
      // items: {
      //   type: Array,
      // },
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
      },
      searchable: {
        type: Boolean
      }
    };
  }

  // observed properties

  // get searchFilter() {
  //   return this._searchFilter;
  // }

  // set searchFilter(val) {
  //   this._searchFilter = val;
  //   if (this.renderRoot){
  //     const grid = this.renderRoot.querySelector('vaadin-grid')
  //     grid._filters = [val];
  //     grid.__applyFilters();
  //   }
  // }

  render() {
    return html`
      ${this.getGridHeaderTemplate()}
      <vaadin-grid .dataProvider="${this.dataProvider}" multi-sort all-rows-visible>
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

  getGridHeaderTemplate() {
    if (!this.searchable)
      return html``;
    return html`
      <vaadin-horizontal-layout id="header">
        <vaadin-text-field placeholder="Search" @value-changed="${debouncer(this.searchValueChanged.bind(this), 800)}">
          <vaadin-icon id="searchIcon" slot="prefix" icon="vaadin:search"></vaadin-icon>
        </vaadin-text-field>
      </vaadin-horizontal-layout>
    `;
  }

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

  actionsRenderer(root, _column, _model) {
    render(html`
      <style>
        vaadin-icon {
          transform: scale(0.7);
        }
      </style>
      <vaadin-icon icon="vaadin:ellipsis-dots-v"></vaadin-icon>
    `, root);
  }

  // search value can be a string and then it will search all items and all columns
  // it can also be a semicolon separated string, the first part is the value
  // the latter part is the columns to be searched
  // eg: value = "32ad3:id,owner id, external id"
  searchValueChanged(e) {
    // grid not loaded
    if(!this.renderRoot || !this.renderRoot.querySelector('vaadin-grid'))
      return;
    const grid = this.renderRoot.querySelector('vaadin-grid');
    const initialValue = e.detail.value;
    // requesting all when showing all
    if(grid._filters.length === 0 && !initialValue)
      return
    let searchFilter;
    if(!initialValue.includes(":")) {
      searchFilter = {value: initialValue, path: "all"}
    } else {
      const [value, paths] = initialValue.split(":");
      const path = paths.split(',')
      searchFilter = {value: value, path: path};
    }
    grid._filters = [searchFilter];
    grid.__applyFilters();
  }
}
