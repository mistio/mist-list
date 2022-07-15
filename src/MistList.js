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
import '@vaadin/grid/vaadin-grid-selection-column.js';
import '@vaadin/icons';
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
      dataProvider: {
        type: Object
      },
      actions: {
        type: Array
      },
      searchable: {
        type: Boolean
      },
      selectable: {
        type: Boolean
      }
    };
  }

  constructor() {
    super();
    this.dataProvider = null;
    this.items = [];
    this.itemMap = {};
    this.frozenColumns = [];
    this.visibleColumns = [];
    this.actions = [];
    this.dataProvider = null;
    this.searchable = false;
    this.selectable = false;
  }

   disconnectedCallback() {
    this.removeEventListener('select-all-changed', this.selectAllChanged);
    super.disconnectedCallback();
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('select-all-changed', this.selectAllChanged);
  }

  // html stuff, main render and helper renderers
  render() {
    return html`
      ${this.getGridHeaderTemplate()}
      <vaadin-grid .dataProvider="${this.dataProvider}" .selectedItems="${this.selectedItems}" multi-sort all-rows-visible>
        ${this.getSelectionColumnTemplate()}
        ${this.getColumnsTemplate()}
      </vaadin-grid>
    `;
  }

  getSelectionColumnTemplate() {
    if (!this.selectable)
      return html``;
    return html`
      <vaadin-grid-selection-column></vaadin-grid-selection-column>
    `;
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

  getColumnsTemplate() {
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
        <vaadin-grid-column
          frozen-to-end
          text-align="center"
          .renderer="${this.actionsRenderer}"
          width="40px">
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
  // end html stuff

  // search value can be a string and then it will search all items and all columns
  // it can also be a semicolon separated string, the first part is the value
  // the latter part is the columns to be searched
  // eg: value = "32ad3:id,owner id, external id"
  // this needs proper implementantion in the data provider to work
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

  selectAllChanged(e) {
    debugger;
  }
}
