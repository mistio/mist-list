import { LitElement, html, css, render } from 'lit';
import { repeat } from 'lit/directives/repeat.js';
import '@vaadin/grid';
import '@vaadin/button';
import '@vaadin/combo-box';
import '@vaadin/multi-select-combo-box';
// import '@mistio/multi-select-search-box';
import '@vaadin/context-menu';
import '@vaadin/menu-bar';
import {
  columnHeaderRenderer,
  columnBodyRenderer,
  // columnFooterRenderer,
  // gridRowDetailsRenderer,
  // GridRowDetailsLitRenderer,
  contextMenuRenderer,
} from 'lit-vaadin-helpers';
import '@vaadin/horizontal-layout';
import '@vaadin/text-field';
import '@vaadin/grid';
import '@vaadin/grid/vaadin-grid-column.js';
import '@vaadin/grid/vaadin-grid-sort-column.js';
import '@vaadin/grid/vaadin-grid-tree-column.js';
import '@vaadin/grid/vaadin-grid-selection-column.js';
import '@vaadin/icons';
import '@vaadin/vaadin-lumo-styles/icons.js';
import '@polymer/iron-icons';
import '@polymer/iron-icon';
import '@polymer/paper-toggle-button';

import { debouncer } from './utils.js';
/* eslint-disable class-methods-use-this */
/* eslint-disable lit/no-template-bind */
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

      vaadin-icon,
      iron-icon {
        color: #444;
      }

      div.listTools {
        display: inline-flex;
        margin-left: 6px;
        margin-right: 8px;
        width: 100%;
        justify-content: end;
        align-items: end;
        height: 62px;
      }

      vaadin-multi-select-combo-box {
        width: 100%;
      }

      #filterIcon {
        margin-top: 4px;
      }

      vaadin-menu-bar.actions {
        max-width: 50%
      }

      h2.title {
        text-transform: capitalize;
      }
      h2.title > span {
        text-transform: none;
        font-weight: 300;
        font-size: 80%;
      }
      .selectColumnsButton {
        margin-right: -4px;
      }
      paper-toggle-button {
        --paper-toggle-button-checked-bar-color: var(--paper-blue-600);
        --paper-toggle-button-checked-button-color: var(--paper-blue-600);
        --paper-toggle-button-checked-ink-color: var(--paper-blue-600);
      }
      .lds-dual-ring {
        display: inline-block;
        width: 32px;
        height: 32px;
        margin: 0px 1px 0px 2px;
      }
      .lds-dual-ring:after {
        content: ' ';
        display: block;
        width: 16x;
        height: 16px;
        margin: 4px;
        border-radius: 50%;
        border: 1px solid #444;
        border-color: #444 transparent #444 transparent;
        animation: lds-dual-ring 1.2s linear infinite;
      }
      @keyframes lds-dual-ring {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }

    `;
  }

  static get properties() {
    return {
      name: {
        type: String,
        reflect: true,
      },
      frozenColumns: {
        type: Array,
      },
      visibleColumns: {
        type: Array,
      },
      dataProvider: {
        type: Object,
      },
      actions: {
        type: Array,
      },
      loading: {
        type: Boolean,
      },
      searchable: {
        type: Boolean,
      },
      selectable: {
        type: Boolean,
      },
      selectedItems: {
        type: Array,
      },
      timeseries: {
        type: Boolean,
      },
      hierarchical: {
        type: Boolean,
      },
      treeView: {
        type: Boolean,
      },
      fullscreen: {
        type: Boolean,
        reflect: true,
      },
      renderers: {
        type: Object,
      },
      primaryField: {
        type: String,
      },
      baseFilter: {
        type: String,
      },
      userFilter: {
        type: String,
      },
      combinedFilter: {
        type: String,
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
    this.loading = false;
    this.selectedItems = [];
    this.timeseries = false;
    this.hierarchical = false;
    this.treeView = false;
    this.primaryField = 'name';
    this.renderers = {};
    this.frozenColumns = [];
    this.visibleColumns = [];
    this.allColumns = new Set();
    this.baseFilter = '';
    this.userFilter = '';
    this.combinedFilter = '';
    this.savedFilters = [{ id: 'yo', name: 'yolo' }];
  }

  get grid() {
    return this.shadowRoot && this.shadowRoot.querySelector('vaadin-grid#grid');
  }
  // _computeFilter: function (baseFilter, userFilter) {
  //   if (!baseFilter) return userFilter;
  //   if (!userFilter) return baseFilter;
  //   return '(' + baseFilter + ') AND (' + userFilter + ')';
  // }

  willUpdate(changedProperties) {
    if (changedProperties.has('dataProvider')) {
      this.dataProvider = this.dataProvider.bind(this);
    }
    if (
      changedProperties.has('hierarchical') &&
      !changedProperties.has('treeView')
    ) {
      this.treeView = this.hierarchical;
    }
  }

  render() {
    return html`
      ${this.renderHeader()}
      <vaadin-grid
        id="grid"
        .dataProvider="${this.dataProvider}"
        .selectedItems="${this.selectedItems}"
        multi-sort
        all-rows-visible
        item-has-children-path="hasChildren"
        theme="no-border row-stripes"
        @mousedown=${e => {
          const checkbox =
            e.path[0].querySelector('vaadin-checkbox') ||
            (e.path[0].querySelector('slot') &&
              e.path[0]
                .querySelector('slot')
                .assignedElements()[0] &&
              e.path[0]
                .querySelector('slot')
                .assignedElements()[0]
                .querySelector('vaadin-checkbox'));
          if (checkbox && e.path[0].tagName !== 'TBODY') {
            checkbox.click();
            e.preventDefault();
          }
        }}
        @active-item-changed=${e => {
          e.target.parentNode.host.dispatchEvent(
            new CustomEvent('active-item-changed', {
              detail: e.detail,
              composed: true,
              bubbles: true,
            })
          );
        }}
        @selected-items-changed=${e => {
          this.selectedItems = e.detail.value;
        }}
      >
        ${this.selectable
          ? html` <vaadin-grid-selection-column
              frozen
              @select-all-changed=${e => {
                if (e.detail.value) {
                  this.selectedItems = Object.values(
                    this.shadowRoot.querySelector('#grid')._cache.items
                  );
                } else {
                  this.selectedItems = [];
                }
              }}
            ></vaadin-grid-selection-column>`
          : ''}
        ${this.renderColumns(this.visibleColumns)}
      </vaadin-grid>
    `;
  }

  renderHeader() {
    return this.searchable
      ? html`
          <vaadin-horizontal-layout class="header">
            <h2 class="title">
              ${this.name}${this.selectedItems.length
                ? html`:
                    <span>&ldquo;${this.selectedItems[0].name}&rdquo;</span
                    >${this.selectedItems.length > 1
                      ? html` <span
                          >&amp; ${this.selectedItems.length - 1} more</span
                        >`
                      : ''}`
                : ''}
            </h2>
            <vaadin-menu-bar class="actions"
              @item-selected=${e=>{e.detail.value.run()()}}
              .items="${this.actions.filter(action => !action.condition || action.condition(this.selectedItems)).map(action => action.component ? action : {
                text: action.name(),
                theme: action.theme,
                run: action.run,
                style: action.style
              })}"
            ></vaadin-menu-bar>
          </vaadin-horizontal-layout>
          <vaadin-horizontal-layout class="header">
            <div class="listTools">
              ${this.loading
                ? html`<div class="lds-dual-ring"></div>`
                : html` <vaadin-button
                    theme="icon small tertiary"
                    aria-label="Reload"
                    @click=${this.reload}
                  >
                    <vaadin-icon icon="lumo:reload"></vaadin-icon>
                  </vaadin-button>`}
              ${this.hierarchical
                ? html`<vaadin-button
                    theme="icon small ${this.treeView ? '' : 'tertiary'}"
                    aria-label="Toggle tree view"
                    @click=${() => {
                      this.treeView = !this.treeView;
                      this.reload();
                    }}
                  >
                    <vaadin-icon icon="vaadin:file-tree-small"></vaadin-icon>
                  </vaadin-button>`
                : ''}
              <vaadin-multi-select-combo-box
                clear-button-visible
                allow-custom-value
                theme="small"
                placeholder="Filter"
                item-label-path="name"
                item-value-path="id"
                .items="${this.savedFilters}"
                @value-changed="${debouncer(
                  this.searchValueChanged.bind(this),
                  800
                )}"
              >
                <iron-icon
                  id="filterIcon"
                  slot="prefix"
                  icon="icons:filter-list"
                ></iron-icon>
                <iron-icon
                  id="saveIcon"
                  slot="suffix"
                  icon="icons:save"
                ></iron-icon>
              </vaadin-multi-select-combo-box>
              <!-- <vaadin-text-field theme="small tertiary" placeholder="Filter" clear-button-visible>
              <iron-icon id="filterIcon" slot="prefix" icon="icons:filter-list"></iron-icon>
              <iron-icon id="saveIcon" icon="icons:save" slot="suffix"></iron-icon>
              <iron-icon id="dropdownIcon" icon="lumo:dropdown" slot="suffix"></iron-icon>
              </vaadin-text-field> -->

              <vaadin-button
                    theme="icon small tertiary"
                    aria-label="Export"
                    @click=${() => {}}
                  >
                    <vaadin-icon icon="vaadin:download"></vaadin-icon>
                  </vaadin-button>
              <vaadin-button
                style="padding-left: 5px"
                theme="icon tertiary small"
                aria-label="Fullscreen"
                @click=${() => {
                  if (this.getAttribute('fullscreen') == null) {
                    this.setAttribute('fullscreen', true);
                  } else {
                    this.removeAttribute('fullscreen');
                  }
                }}
              >
                <iron-icon
                  icon="icons:fullscreen${this.fullscreen ? '-exit' : ''}"
                ></iron-icon>
              </vaadin-button>
            </div>
            <slot> </slot>
          </vaadin-horizontal-layout>
        `
      : '';
  }

  renderColumns() {
    let frozenTemplate = html``;
    let visibleTemplate = html``;
    let actionsTemplate = html``;

    if (this.treeView) {
      frozenTemplate = html` <vaadin-grid-tree-column
        frozen
        width="30%"
        path="${this.primaryField}"
        ${this.renderers && this.renderers[this.primaryField]
          ? columnBodyRenderer(() => html`lalala`, [])
          : () => html``}
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
          ${columnHeaderRenderer(
            () => html` <vaadin-context-menu
              class="selectColumnsButton"
              open-on="click"
              ${contextMenuRenderer(this.renderColumnSelectContextMenuItem)}
            >
              <vaadin-button
                theme="icon tertiary small"
                aria-label="Select columns"
              >
                <iron-icon icon="icons:view-column"></iron-icon>
              </vaadin-button>
            </vaadin-context-menu>`
          )}
          theme="wrap-cell-content"
          width="40px"
        >
        </vaadin-grid-column>
      `;
    }
    return html` ${frozenTemplate} ${visibleTemplate} ${actionsTemplate} `;
  }

  renderColumn(column, frozen = false) {
    if (
      this.renderers &&
      this.renderers[column] &&
      this.renderers[column].title
    ) {
      return html`
        <vaadin-grid-column
          ?frozen=${frozen}
          path="${column}"
          resizable
          ${this.renderers && this.renderers[column]
            ? columnHeaderRenderer(this.renderers[column].title, [])
            : () => html``}
          ${this.renderers && this.renderers[column]
            ? columnBodyRenderer(this.renderers[column].body, [])
            : () => html``}
        >
        </vaadin-grid-column>
      `;
    }

    return html`
      <vaadin-grid-sort-column
        ?frozen=${frozen}
        path="${column}"
        resizable
        header=${this.renderers &&
        this.renderers[column] &&
        this.renderers[column].title &&
        this.renderers[column].title()}
        ${this.renderers && this.renderers[column]
          ? columnBodyRenderer(this.renderers[column].body, [])
          : () => html``}
      >
      </vaadin-grid-sort-column>
    `;
  }

  renderActionButton(root, row, column) {
    render(
      html`
        <vaadin-context-menu
          @item-selected=${e => {
            const action = this.actions.find(
              i => i.name() === e.detail.value.text
            );
            action.run([column.item])();
            this.dispatchEvent(
              new CustomEvent('select-action', {
                detail: { action: e.detail.value.text, item: column.item },
              })
            );
          }}
          open-on="click"
          .items=${this.actions
            ? this.actions
                .filter(x => !x.condition || x.condition([x]))
                .map(x => (x.component ? x : { text: x.name([x]) }))
            : []}
        >
          <vaadin-button
            theme="icon tertiary small"
            aria-label="Actions"
            style="margin-left: -8px; padding: 0;"
          >
            <vaadin-icon
              icon="vaadin:ellipsis-dots-v"
              style="transform: scale(0.75)"
            ></vaadin-icon>
          </vaadin-button>
        </vaadin-context-menu>
      `,
      root
    );
  }

  renderColumnSelectContextMenuItem() {
    return html` <vaadin-grid
      id="visibleColumns"
      @click=${e => {
        e.stopPropagation();
      }}
      style='width: 250px; border: none; border-bottom: 1px solid #eee; height: ${49 + this.visibleColumns.length*32}px'
      .items=${this.visibleColumns.map(x=>({name: x}))}
      ?rows-draggable="${true}"
      drop-mode="between"
      @grid-dragstart="${event => {
        [this.draggedItem] = event.detail.draggedItems;
      }}"
      @grid-dragend="${() => {
        delete this.draggedItem;
      }}"
      @grid-drop="${event => {
        const { dropTargetItem, dropLocation } = event.detail;
        // only act when dropping on another item
        if (this.draggedItem && dropTargetItem !== this.draggedItem) {
          // remove the item from its previous position
          const draggedItemIndex = this.visibleColumns.indexOf(
            this.draggedItem.name
          );
          this.visibleColumns.splice(draggedItemIndex, 1);
          // re-insert the item at its new position
          const dropIndex =
            this.visibleColumns.indexOf(dropTargetItem.name) +
            (dropLocation === 'below' ? 1 : 0);
          this.visibleColumns.splice(dropIndex, 0, this.draggedItem.name);
          // re-assign the array to refresh the grid
          this.visibleColumns = [...this.visibleColumns];
          this.shadowRoot.querySelector('vaadin-context-menu.selectColumnsButton').requestContentUpdate();
        }
      }}"
    >
      <vaadin-grid-column
        path="name"
        ${columnHeaderRenderer(() => html`    <div style="float: right; font-size: 70%; color: #555">drag to reorder</div>Columns`)}
        ${columnBodyRenderer((item) => html`
          <iron-icon icon="editor:drag-handle" style="float: right"></iron-icon>
          <paper-toggle-button
            checked
            @change=${(e)=>{
              const col = e.target.textContent.trim();
              let i = this.visibleColumns.indexOf(col);
              if (i>-1) {
                this.visibleColumns.splice(i, 1);
              }
              this.shadowRoot.querySelector('vaadin-context-menu.selectColumnsButton').requestContentUpdate();
              document.body.querySelector('vaadin-grid#visibleColumns').querySelectorAll('paper-toggle-button').forEach(x=>{x.checked=true;})
              document.body.querySelector('vaadin-grid#invisibleColumns').querySelectorAll('paper-toggle-button').forEach(x=>{x.checked=false;})
              this.requestUpdate();
            }}>
            <strong>${item.name}</strong>
          </paper-toggle-button>
          `)}
      ></vaadin-grid-column>
    </vaadin-grid>
    <vaadin-grid
      id="invisibleColumns"
      .items=${Array.from(this.allColumns).filter(x=>!this.visibleColumns.find(v=>v===x)).map(x=>({name: x}))}
      @click=${e => {
        e.stopPropagation();
      }}
      style='width: 250px; border: none; height: ${(this.allColumns.size-this.visibleColumns.length)*33}px'
      >
      <vaadin-grid-column
        path="name"
        ${columnHeaderRenderer(() => html``)}
        ${columnBodyRenderer((item) => html`
          <paper-toggle-button
            ?checked=${false}
            @change=${(e)=>{
              const col = e.target.textContent.trim();
              let i = this.visibleColumns.indexOf(col);
              if (i === -1) {
                this.visibleColumns.push(col);
              }
              this.shadowRoot.querySelector('vaadin-context-menu.selectColumnsButton').requestContentUpdate();
              document.body.querySelector('vaadin-grid#visibleColumns').querySelectorAll('paper-toggle-button').forEach(x=>{x.checked=true;})
              document.body.querySelector('vaadin-grid#invisibleColumns').querySelectorAll('paper-toggle-button').forEach(x=>{x.checked=false;})
              this.requestUpdate();
            }}>
            ${item.name}
          </paper-toggle-button>
          `)}
      ></vaadin-grid-column>
    </vaadin-grid>
    `;
  }

  orderedColumns() {
    const ret = [];
    // this.frozenColumns.forEach(i => {
    //   ret.push({name: i});
    // });
    this.visibleColumns.forEach(i => {
      ret.push({ name: i, visible: true });
    });
    Array.from(this.allColumns).forEach(i => {
      if (!ret.find(j => j.name === i)) {
        ret.push({ name: i, visible: false });
      }
    });
    return ret;
  }

  reload() {
    this.selectedItems = [];
    const dp = this.dataProvider;
    this.dataProvider = () => {};
    this.grid.clearCache();
    this.dataProvider = dp;
  }

  // search value can be a string and then it will search all items and all columns
  // it can also be a semicolon separated string, the first part is the value
  // the latter part is the columns to be searched
  // eg: value = "32ad3:id,owner id, external id"
  // this needs proper implementantion in the data provider to work
  searchValueChanged(e) {
    this.userFilter = e.detail.value;
    // grid not loaded
    if (!this.renderRoot || !this.renderRoot.querySelector('vaadin-grid'))
      return;
    const grid = this.renderRoot.querySelector('vaadin-grid');
    const initialValue = e.detail.value;
    // requesting all when showing all
    if (grid._filters.length === 0 && !initialValue) return;
    let searchFilter;
    if (!initialValue.includes(':')) {
      searchFilter = { value: initialValue, path: 'all' };
    } else {
      const [value, paths] = initialValue.split(':');
      const path = paths.split(',');
      searchFilter = { value, path };
    }
    grid._filters = [searchFilter];
    grid.__applyFilters();
  }
}
