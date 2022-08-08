import { LitElement, html, css, render } from 'lit';
import { repeat } from 'lit/directives/repeat.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import '@vaadin/grid';
import {
  columnHeaderRenderer,
  columnBodyRenderer,
  // columnFooterRenderer,
  // gridRowDetailsRenderer,
  // GridRowDetailsLitRenderer
} from 'lit-vaadin-helpers';
import "@vaadin/horizontal-layout";
import "@vaadin/text-field";
import '@vaadin/grid/vaadin-grid-column.js';
import '@vaadin/grid/vaadin-grid-sort-column.js';
import '@vaadin/grid/vaadin-grid-tree-column.js';
import '@vaadin/grid/vaadin-grid-selection-column.js';
import '@vaadin/icons';
import '@polymer/iron-icons';
import '@polymer/iron-icon';
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
        justify-content: space-between;
      }

      #filterIcon {
        color: black;
      }

      div.listTools {
        margin-left: 6px;
      }
    `;
  }

  static get properties() {
    return {
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
      },
      timeseries: {
        type: Boolean
      },
      treeView: {
        type: Boolean
      },
      renderers: {
        type: Object
      },
      primaryField: {
        type: String
      }
    };
  }

  constructor() {
    super();
    this.dataProvider = null;
    this.actions = [];
    this.searchable = false;
    this.selectable = false;
    this.timeseries = false;
    this.treeView = false;
    this.primaryField = 'id';
    this.renderers = {};
    this.frozenColumns = [];
    this.visibleColumns = [];
    this.allColumns = new Set();
  }

  // disconnectedCallback() {
  //   this.removeEventListener('select-all-changed', this.selectAllChanged);
  //   super.disconnectedCallback();
  // }

  // connectedCallback() {
  //   super.connectedCallback();
  //   this.addEventListener('select-all-changed', this.selectAllChanged);
  // }

  willUpdate(changedProperties) {
    if (changedProperties.has('dataProvider')) {
      this.dataProvider = this.dataProvider.bind(this);
    }
    if (changedProperties.has('renderers')) {
      debugger;
    }
  }

  // html stuff, main render and helper renderers
  render() {
    return html`
      ${this.searchable ? html`
      <vaadin-horizontal-layout id="header">
        <div class="listTools">
          <vaadin-text-field placeholder="Filter" @value-changed="${debouncer(this.searchValueChanged.bind(this), 800)}">
            <iron-icon id="filterIcon" slot="prefix" icon="icons:filter-list"></iron-icon>
          </vaadin-text-field>
        </div>
        <slot></slot>
      </vaadin-horizontal-layout>
    ` : ''}
      <vaadin-grid id="grid"
        .dataProvider="${this.dataProvider}"
        .selectedItems="${this.selectedItems}"
        multi-sort all-rows-visible theme="no-border"
        @active-item-changed=${
          (e)=>{e.target.parentNode.host.dispatchEvent(
            new CustomEvent('active-item-changed', {
              detail: e.detail, composed: true, bubbles: true }))}
        }
      >
        ${this.selectable ? html`
      <vaadin-grid-selection-column frozen></vaadin-grid-selection-column>
    ` : ''}
        ${this.renderColumns()}
      </vaadin-grid>
    `;
  }

  renderColumns() {
    // add tree view later!!!
    let frozenTemplate = html``;
    let visibleTemplate = html``;
    let actionsTemplate = html``;

    if (this.frozenColumns.length > 0) {
      frozenTemplate = html`
        ${repeat(
          this.frozenColumns,
          column => column,
          column => this.renderColumn(column, true)
        )}
      `;
    }
    if (this.visibleColumns.length > 0) {
      visibleTemplate = html`
        ${repeat(
          this.visibleColumns,
          column => column,
          column => this.renderColumn(column, false)
        )}
      `;
    }

    if (this.actions.length > 1) {
      actionsTemplate = html`
        <vaadin-grid-column
          frozen-to-end
          text-align="center"
          .renderer="${this.renderActions}"
          width="40px">
        </vaadin-grid-column>
      `;
    }
    return html` ${frozenTemplate} ${visibleTemplate} ${actionsTemplate} `;
  }

  renderColumn(column, frozen=false) {
    if (this.renderers && this.renderers[column] && this.renderers[column].title) {
      return html`
            <vaadin-grid-column
              ?frozen=${frozen} path="${column}" resizable
              ${this.renderers && this.renderers[column] ? columnHeaderRenderer(this.renderers[column].title, []) : () => html``}
              ${this.renderers && this.renderers[column] ? columnBodyRenderer(this.renderers[column].body, []) : () => html``}
            >
            </vaadin-grid-column>
          `
    } else {
      return html`
            <vaadin-grid-sort-column
              frozen path="${column}" resizable
              header=${this.renderers && this.renderers[column] && this.renderers[column].title && this.renderers[column].title()}
              ${this.renderers && this.renderers[column] ? columnBodyRenderer(this.renderers[column].body, []) : () => html``}
            >
            </vaadin-grid-sort-column>
          `
    }
  }

  renderActions(root, _column, _model) {
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
