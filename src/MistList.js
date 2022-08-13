import { LitElement, html, css, render } from 'lit';
import { repeat } from 'lit/directives/repeat.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import '@vaadin/grid';
import '@vaadin/button';
import '@vaadin/combo-box';
import '@vaadin/multi-select-combo-box';
import '@mistio/multi-select-search-box';
import '@vaadin/context-menu';
import {
  columnHeaderRenderer,
  columnBodyRenderer,
  // columnFooterRenderer,
  // gridRowDetailsRenderer,
  // GridRowDetailsLitRenderer,
  contextMenuRenderer,
} from 'lit-vaadin-helpers';
import "@vaadin/horizontal-layout";
import "@vaadin/text-field";
import '@vaadin/grid/vaadin-grid-column.js';
import '@vaadin/grid/vaadin-grid-sort-column.js';
import '@vaadin/grid/vaadin-grid-tree-column.js';
import '@vaadin/grid/vaadin-grid-selection-column.js';
import '@vaadin/icons';
import '@vaadin/vaadin-lumo-styles/icons.js';
import '@polymer/iron-icons';
import '@polymer/iron-icon';
import { debouncer } from "./utils.js";
/* eslint-disable class-methods-use-this */
export class MistList extends LitElement {
  static get styles() {
    return css`
      :host([fullscreen]) {
          position: fixed;
          top: 0px;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 99999;
          background-color: #fff;
          min-height: 100vh !important;
          height: 100vh !important;
          max-width: 100%;
      }

      vaadin-grid {
        height: 100%;
      }

      .header {
        background-color: white;
        align-items: center;
        justify-content: space-between;
      }

      vaadin-icon, iron-icon {
        color: #444;
      }

      div.listTools {
        display: inline-flex;
        margin-left: 6px;
        width: 50%;
        justify-content: end;
        align-items: end;
        height: 62px;
      }

      vaadin-multi-select-combo-box {
        width: 100%
      }

      #filterIcon {
        margin-top: 4px;
      }

      div.actions {
        display: flex;
        align-items: baseline;
        justify-content: end;
      }

      h2.title {
        text-transform: capitalize;
      }
    `;
  }

  static get properties() {
    return {
      name: {
        type: String,
        reflect: true
      },
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
      selectedItems: {
        type: Array
      },
      timeseries: {
        type: Boolean
      },
      treeView: {
        type: Boolean
      },
      fullscreen: {
        type: Boolean,
        reflect: true
      },
      renderers: {
        type: Object
      },
      primaryField: {
        type: String
      },
      baseFilter: {
        type: String
      },
      userFilter: {
        type: String
      },
      combinedFilter: {
        type: String
      },
    };
  }

  constructor() {
    super();
    this.dataProvider = null;
    this.actions = [];
    this.searchable = false;
    this.selectable = false;
    this.fullscreen = false;
    this.selectedItems = [];
    this.timeseries = false;
    this.treeView = false;
    this.primaryField = 'name';
    this.renderers = {};
    this.frozenColumns = [];
    this.visibleColumns = [];
    this.allColumns = new Set();
    this.baseFilter = '';
    this.userFilter = '';
    this.combinedFilter = '';
    this.savedFilters = [
      {id: 'yo', name:'yolo'}
    ]
  }

  // disconnectedCallback() {
  //   super.disconnectedCallback();
  // }

  // connectedCallback() {
  //   super.connectedCallback();
  // }

  // _computeFilter: function (baseFilter, userFilter) {
  //   if (!baseFilter) return userFilter;
  //   if (!userFilter) return baseFilter;
  //   return '(' + baseFilter + ') AND (' + userFilter + ')';
  // }


  willUpdate(changedProperties) {
    if (changedProperties.has('dataProvider')) {
      this.dataProvider = this.dataProvider.bind(this);
    }
    // if (changedProperties.has('renderers')) {
    //   debugger;
    // }
  }

  // updateComplete(changedProperties) {
  //   if (changedProperties.has('selectedItems')) {
  //     this.dispatchEvent(
  //       new CustomEvent('selected-items-changed', {
  //         detail: {value: this.selectedItems},
  //         bubbles: true,
  //         composed: true,
  //       }));
  //   }
  // }

  render() {
    return html`
      ${this.renderHeader()}
      <vaadin-grid id="grid"
        .dataProvider="${this.dataProvider}"
        .selectedItems="${this.selectedItems}"
        multi-sort all-rows-visible theme="no-border row-stripes"
        @active-item-changed=${
          (e)=>{e.target.parentNode.host.dispatchEvent(
            new CustomEvent('active-item-changed', {
              detail: e.detail, composed: true, bubbles: true }))}
        }
        @selected-items-changed=${
          (e)=>{
            this.selectedItems = e.detail.value;
          }
        }
      >
        ${this.selectable ? html`
          <vaadin-grid-selection-column frozen
            @select-all-changed=${(e) => {
              if (e.detail.value) {
                this.selectedItems = Object.values(this.shadowRoot.querySelector('#grid')._cache.items);
              } else {
                this.selectedItems = [];
              }
            }
          }></vaadin-grid-selection-column>` : ''}
        ${this.renderColumns(this.visibleColumns)}
      </vaadin-grid>
    `;
  }

  renderHeader() {
    return this.searchable ? html`
      <vaadin-horizontal-layout class="header">
        <h2 class="title">
          ${this.name}${this.selectedItems.length === 1 ? `: "${  this.selectedItems[0].name  }"` : this.selectedItems.length ? html`: ${this.selectedItems.length}` : ''}</h2>
        <div class="actions">
          ${repeat(
            this.actions.filter(x=>x.condition(this.selectedItems)),
            action => action,
            action => html`
              <vaadin-button
                @click=${action.run(this.selectedItems)}
                theme="${action.theme}"
                >${action.name(this.selectedItems)}</vaadin-button>
            `
          )}

        </div>
      </vaadin-horizontal-layout>
      <vaadin-horizontal-layout class="header">
        <div class="listTools">
          <vaadin-multi-select-combo-box
            clear-button-visible
            allow-custom-value
            theme="small"
            placeholder="Filter"
            item-label-path="name"
            item-value-path="id"
            .items="${this.savedFilters}"
            @value-changed="${debouncer(this.searchValueChanged.bind(this), 800)}"
            @selected-item-changed=${e=>{debugger;}}
          >
            <iron-icon id="filterIcon" slot="prefix" icon="icons:filter-list"></iron-icon>
            <iron-icon id="saveIcon" slot="suffix" icon="icons:save" @click=${e=>{debugger}} ></iron-icon>
          </vaadin-multi-select-combo-box>
          <!-- <vaadin-text-field theme="small tertiary" placeholder="Filter" clear-button-visible
            @value-changed="${debouncer(this.searchValueChanged.bind(this), 800)}">
              <iron-icon id="filterIcon" slot="prefix" icon="icons:filter-list"></iron-icon>
              <iron-icon id="saveIcon" icon="icons:save" slot="suffix" @click=${e=>{debugger}} ?hidden=${!this.userFilter || this.savedFilters.find(x => x.id === this.userFilter) !== undefined}></iron-icon>
              <iron-icon id="dropdownIcon" icon="lumo:dropdown" slot="suffix" @click=${e=>{debugger}} ?hidden=${!this.savedFilters.length}></iron-icon>
          </vaadin-text-field> -->
        </div>
        <div class="listTools">
          <vaadin-button theme="icon ${this.treeView ? '' : 'tertiary'}" aria-label="Toggle tree view" @click=${()=>{this.treeView = !this.treeView;}}>
            <vaadin-icon icon="vaadin:file-tree-small"></vaadin-icon>
          </vaadin-button>
          <vaadin-context-menu
            open-on="click"
            ${contextMenuRenderer(this.renderColumnSelectContextMenuItem)}
          >
            <vaadin-button theme="icon tertiary" aria-label="Select columns">
              <iron-icon icon="icons:view-column"></iron-icon>
            </vaadin-button>
          </vaadin-context-menu>
          <vaadin-button theme="icon tertiary" aria-label="Select columns" @click=${(e)=>{
            if (this.getAttribute('fullscreen') == null) {
              this.setAttribute('fullscreen', true);
            } else {
              this.removeAttribute('fullscreen');
            }
          }}>
            <iron-icon icon="icons:fullscreen${this.fullscreen ? '-exit' : ''}"></iron-icon>
          </vaadin-button>
        </div>
        <slot>
        </slot>
      </vaadin-horizontal-layout>
    ` : ''
  }

  renderColumns() {
    let frozenTemplate = html``;
    let visibleTemplate = html``;
    let actionsTemplate = html``;

    if (this.treeView) {
      frozenTemplate = html`
        <vaadin-grid-tree-column frozen
          path="${this.primaryField}"
          item-has-children-path="hasChildren"
        ></vaadin-grid-tree-column>`;
    } else if (this.frozenColumns.length > 0) {
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
          text-align="end"
          .renderer="${this.renderActionButton.bind(this)}"
          theme="wrap-cell-content"
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
            ?frozen=${frozen} path="${column}" resizable
              header=${this.renderers && this.renderers[column] && this.renderers[column].title && this.renderers[column].title()}
              ${this.renderers && this.renderers[column] ? columnBodyRenderer(this.renderers[column].body, []) : () => html``}
            >
            </vaadin-grid-sort-column>
          `
    }
  }

  renderActionButton(root, _column, _model) {
    render(html`
      <vaadin-context-menu
        open-on="click"
        .items=${this.actions ? this.actions.filter(x=>x.condition([x])).map(x => {return {text: x.name([x])}}) : []}>
        <vaadin-button theme="icon tertiary small" aria-label="Actions" style="margin-left: -8px; padding: 0;">
          <vaadin-icon icon="vaadin:ellipsis-dots-v" style="transform: scale(0.75)"></vaadin-icon>
        </vaadin-button>
      </vaadin-context-menu>
    `, root);
  }

  renderColumnSelectContextMenuItem(root, contextMenu, context) {
    return html`
      <vaadin-grid id="selectColumns"
        @click=${(e)=>{e.stopPropagation()}}
        style="width: 250px"
        .items=${this.orderedColumns(this.frozenColumns, this.visibleColumns)}
        ?rows-draggable="${true}"
        drop-mode="between"
        @loading-changed=${(e)=>{
          // this.frozenColumns.forEach(i => e.target.selectItem(e.target.items.find(j => j.name === i)));
          this.visibleColumns.forEach(i => e.target.selectItem(e.target.items.find(j => j.name === i)));
          e.target.addEventListener('selected-items-changed', e=>{
            this.visibleColumns.forEach(
              c => {
                if (!e.target.selectedItems.find(i=> i.name===c)) {
                  this.visibleColumns.splice(this.visibleColumns.indexOf(c), 1);
                  this.requestUpdate();
                }
              });
            e.target.selectedItems.forEach(i => {
              if (this.visibleColumns.indexOf(i.name) == -1) {
                this.visibleColumns.push(i.name)
                this.requestUpdate();
              }
            })
            e.stopPropagation();
          });
        }}
        @grid-dragstart="${(event) => {
          this.draggedItem = event.detail.draggedItems[0];
        }}"
        @grid-dragend="${() => {
          delete this.draggedItem;
        }}"
        @grid-drop="${(event) => {
          const { dropTargetItem, dropLocation } = event.detail;
          // only act when dropping on another item
          if (this.draggedItem && dropTargetItem !== this.draggedItem) {
            // remove the item from its previous position
            const draggedItemIndex = this.visibleColumns.indexOf(this.draggedItem.name);
            this.visibleColumns.splice(draggedItemIndex, 1);
            // re-insert the item at its new position
            const dropIndex =
              this.visibleColumns.indexOf(dropTargetItem.name) + (dropLocation === 'below' ? 1 : 0);
            this.visibleColumns.splice(dropIndex, 0, this.draggedItem);
            // re-assign the array to refresh the grid
            this.visibleColumns = [...this.visibleColumns];
          }
        }}"
        >
        <vaadin-grid-selection-column
        ></vaadin-grid-selection-column>
        <vaadin-grid-column path="name" header="Select & reorder columns"></vaadin-grid-column>
      </vaadin-grid>`;
  }

  orderedColumns() {
    let ret = [];
    // this.frozenColumns.forEach(i => {
    //   ret.push({name: i});
    // });
    this.visibleColumns.forEach(i => {
      ret.push({name: i});
    });
    Array.from(this.allColumns).forEach(i => {
      if (!ret.find(j => j.name === i)) {
        ret.push({name: i})
      }
    });
    return ret;
  }

  // search value can be a string and then it will search all items and all columns
  // it can also be a semicolon separated string, the first part is the value
  // the latter part is the columns to be searched
  // eg: value = "32ad3:id,owner id, external id"
  // this needs proper implementantion in the data provider to work
  searchValueChanged(e) {
    this.userFilter = e.detail.value;
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
