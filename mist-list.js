/* eslint-disable no-console */
import '@polymer/polymer/polymer-legacy.js';
import '@vaadin/vaadin-grid/vaadin-grid.js';
import '@vaadin/vaadin-grid/vaadin-grid-sorter.js';
import '@vaadin/vaadin-grid/vaadin-grid-selection-column.js';
import '@vaadin/vaadin-grid/vaadin-grid-tree-column.js';
import '@polymer/paper-button/paper-button.js';
import '@vaadin/vaadin-dialog/vaadin-dialog.js';
import '@polymer/paper-menu-button/paper-menu-button.js';
import '@polymer/paper-input/paper-input.js';
import '@polymer/paper-item/paper-item.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/paper-checkbox/paper-checkbox.js';
import '@polymer/paper-listbox/paper-listbox.js';
import '@advanced-rest-client/json-viewer/json-viewer.js';
import './mist-check.js';
import './mist-filter.js';
import './mist-list-actions.js';
import './rest-data-provider.js';
import { Polymer } from '@polymer/polymer/lib/legacy/polymer-fn.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
// import 'moment/moment.js';

// eslint-disable-next-line camelcase
const $_documentContainer = document.createElement('template');

$_documentContainer.innerHTML = `<dom-module id="mist-list-grid" theme-for="vaadin-grid">
    <template>
        <style>
            /* patch vaadin-grid style to remove padding in selection column to prevent clicks around the checkbox to activate the item */
            [part~="cell"]:first-child ::slotted(vaadin-grid-cell-content) {padding: 0 !important;}
            [part~="row"]:hover > [part~="body-cell"] {background-color: #eee !important}
            [part~="header-cell"] {background-color: #f2f2f2 !important;}
            /* patch vaadin-grid style to make sure actions appear be on top of column headers */
            thead th:first-child {z-index: 3 !important;}

            :host([theme~="row-stripes"]) [part~="row"]:not([odd]) [part~="body-cell"] {
                background-color: rgb(249, 249, 249);
                background-image: none; /*linear-gradient(rgb(249, 249, 249), rgb(249, 249, 249));*/
            }

            [part="row"]:only-child [part~="header-cell"] {
                border-bottom: 1px solid #dbdbdb;
                background-color: rgba(240, 240, 240, 1);
            }

            [part~="row"] {
            }

            [part~="row"][selected] > [part~="body-cell"] {
                /*background-color: rgba(255, 255, 141, 0.9) !important;*/
                background-image: linear-gradient(rgba(255, 255, 141, 0.8), rgba(255, 255, 141, .7)) !important;
            }

            [part~="cell"] {
                /* Styles that affect all grid cells, including header, body and footer cells */
                border-bottom: 1px solid #dbdbdb;
            }

            [part~="body-cell"] {
                /* Styles that only affect all body cells */
            }

            :host([theme~="compact"]) [part="row"]:only-child [part~="header-cell"] {
                min-height: 49px;
            }
            :host([theme~="compact"]) [part~="cell"]:first-child ::slotted(vaadin-grid-cell-content) {
                padding: 0;
            }
        </style>
    </template>
</dom-module>`;

document.head.appendChild($_documentContainer.content);
Polymer({
  // eslint-disable-next-line lit/no-legacy-template-syntax
  _template: html`
    <style>
      [hidden] {
        display: none !important;
      }

      :host {
        display: block;
        font-family: inherit;
        font: 400 14px;
      }

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

      :host([resizable]) {
        padding: 0;
        margin: auto;
      }

      :host([selectable]) vaadin-grid {
        --vaadin-grid-cell: {
          cursor: pointer;
        }
      }

      :host([toolbar]) vaadin-grid {
        height: calc(100% - 64px);
      }

      .header {
        background: transparent;
        min-height: 42px;
      }

      mist-list-actions {
        width: 100%;
        justify-content: flex-start;
        font-size: var(--mist-list-actions-font-size,14px);
      }

      vaadin-grid {
        height: 100%;
        font-family: inherit;
        font-weight: 400;
        font-size: 14px;
        color: #424242;
      }

      vaadin-grid:not([actions]) {
        margin-top: -50px;
      }

      a {
        color: var(--mist-list-link-color);
      }

      vaadin-grid::content div#table,
      vaadin-grid::slotted(div#table) {
        outline-width: 0px !important;
      }

      vaadin-grid input[type='checkbox'] {
        height: 16px;
        width: 16px;
      }

      vaadin-grid .image {
        height: 40px;
        width: 40px;
        display: inline-block;
        border-radius: 50%;
        vertical-align: middle;
        margin-right: 15px;
      }

      vaadin-grid .header-content {
        display: flex;
        padding: 16px;
        justify-content: space-between;
      }

      vaadin-grid .details-cell {
        width: 100%;
        font-size: 12px;
      }

      vaadin-grid .details {
        display: block;
        font-family: monospace;
        overflow-x: auto;
        overflow-y: scroll;
        height: 266px;
        margin: 0 0px 0 34px;
        border-left: 1px dashed #ddd;
        padding-left: 10px;
      }

      vaadin-grid .details table {
        position: inherit;
        padding-left: 0px;
        overflow: scroll;
        border-spacing: 0px;
      }

      vaadin-grid .details table tbody {
        border-top: 1px solid #dbdbdb;
        border-bottom: 1px solid #dbdbdb;
        margin-top: 2px;
        margin-bottom: 2px;
      }

      vaadin-grid .details table tr.keys {
        display: none;
      }

      vaadin-grid .details td.key {
        font-weight: bold;
        min-width: 155px;
        border-right: 1px solid #dbdbdb;
        padding: 3px 16px 3px 30px;
        text-align: right;
        vertical-align: top;
      }

      vaadin-grid .details td.value {
        padding-left: 8px;
        white-space: pre-wrap;
        text-align: left;
        display: -webkit-box;
        max-height: 200px;
        overflow-y: auto;
        border-bottom: 1px dotted #eee;
      }

      vaadin-grid-sorter,
      span.header {
        text-transform: uppercase;
        font-size: 14px;
        font-weight: 400;
      }

      paper-input {
        display: inline-block;
        width: 100%;
      }

      mist-check {
        padding: 10px 0px 6px 8px;
      }

      mist-check::slotted(iron-icon) {
        color: #424242;
      }

      div#actions {
        background-color: #666;
        z-index: 3;
        position: relative;
        color: #fff;
        display: flex;
        top: 0;
        width: calc(100% - 32px);
        border: 1px solid #666;
        top: 1px;
      }

      app-toolbar {
        --paper-toolbar-background: #fff;
        background-color: #fff;
        border: 1px solid #dbdbdb;
        border-bottom: 0 none;
        color: #000;
        display: flex;
      }

      vaadin-dialog {
        width: 400px;
        max-width: 100%;
        font-family: inherit;
      }

      .vaadin-dialog-scrollable p {
        display: block;
        width: 100%;
      }

      .vaadin-dialog-scrollable {
        font-family: inherit;
        display: flex;
        overflow-y: scroll;
        flex-wrap: wrap;
        justify-content: flex-start;
        width: 500px;
        padding: 0;
        max-height: 500px;
      }

      .vaadin-dialog-scrollable paper-item {
        max-width: 200px;
        width: 50%;
      }

      .buttons {
        display: flex;
        justify-content: flex-end;
        padding: 24px 0;
      }

      span.title {
        overflow: visible !important;
        text-transform: capitalize;
        font-weight: 600;
      }

      span.count {
        font-size: 14px;
        display: flex;
        opacity: 0.5;
        padding-right: 16px;
        padding-left: 20px;
        align-self: center;
      }

      .toolbar-buttons {
        align-items: center;
        padding: 4px 8px;
        border-left: 1px dotted #ddd;
      }

      paper-menu-button.column-menu {
        z-index: 1;
        padding: calc(var(--row-height) / 2 - 25px) 0;
        margin-left: -8px;
        color: #666;
      }

      .nodata {
        padding: 24px;
        font-style: italic;
        text-align: center;
      }

      paper-listbox paper-item {
        cursor: pointer;
      }

      paper-listbox paper-item.filter {
        padding: 0;
        padding-left: 16px !important;
      }

      paper-listbox paper-item.filter.all-items {
        text-transform: capitalize;
        padding-right: 16px !important;
      }

      paper-item.column-item {
        cursor: grab;
      }

      #presetFilters {
        display: flex;
        flex-direction: row;
      }

      #presetFilters span {
        flex: 1;
      }

      paper-icon-button.clear-filter {
        opacity: 0.5;
        transform: scale(0.7);
      }

      vaadin-dialog > .buttons {
        padding: 24px;
      }

      mist-list-actions {
        fill: #fff;
      }

      .error {
        color: var(--mist-list-error-color);
      }

      .orange {
        color: var(--mist-list-orange-color);
      }

      .green {
        color: var(--mist-list-green-color);
      }

      .tag {
        @apply --mist-list-tag-mixin;
      }
      h2.dialog-title {
        font-size: 20px;
        font-weight: 500;
      }

      json-viewer {
        font-size: 0.9em;
      }
    </style>
    <template is="dom-if" restamp="" if="[[rest]]">
      <rest-data-provider
        id="restProvider"
        url="[[apiurl]]"
        provider="{{dataProvider}}"
        loading="{{_loading}}"
        count="{{count}}"
        received="{{received}}"
        columns="{{columns}}"
        frozen="[[frozen]]"
        item-map="{{itemMap}}"
        primary-field-name="[[primaryFieldName]]"
        timeseries="[[timeseries]]"
        filter="[[combinedFilter]]"
        finished="{{finished}}"
      ></rest-data-provider>
    </template>
    <slot id="slottedHeader" name="header"></slot>
    <app-toolbar hidden="[[!toolbar]]">
      <mist-filter
        id="[[id]]"
        name="[[name]]"
        searchable="[[searchable]]"
        base-filter="[[baseFilter]]"
        user-filter="{{userFilter}}"
        combined-filter="{{combinedFilter}}"
        editing-filter="{{editingFilter}}"
        preset-filters="[[presetFilters]]"
      >
        <span class="count" hidden="[[timeseries]]" slot="count">
          <sub hidden="[[!count]]"
            ><template is="dom-if" if="[[!_hasReceivedAll(received,count)]]" restamp=""
              >[[received]]/</template
            >[[count]]</sub
          >
        </span>
      </mist-filter>
      <span class="toolbar-buttons" hidden="[[!enableFullscreen]]">
        <paper-icon-button
          icon="icons:fullscreen"
          hidden="[[fullscreen]]"
          on-tap="_enterFullscreen"
          id="fullscreenBtn"
        ></paper-icon-button>
        <paper-icon-button
          icon="icons:fullscreen-exit"
          hidden="[[!fullscreen]]"
          on-tap="_exitFullscreen"
          id="exitFullscreenBtn"
        ></paper-icon-button>
      </span>
    </app-toolbar>

    <template is="dom-if" if="[[hasVisibleColumns]]" restamp="">
      <vaadin-dialog id="columnsDialog" opened="{{columnsDialogOpened}}" aria-label="styled">
        <template>
          <h2 class="dialog-title">Select columns and order</h2>
          <p>Select the list's visible columns. Drag to arrange their order.</p>
          <div class="vaadin-dialog-scrollable">
            <template is="dom-if" if="[[columnsDialogOpened]]" restamp="">
              <sortable-list
                id="columnsSortable"
                sortable=".column-item"
                on-sort-start="_onSortStart"
                on-sort-finish="_onSortFinish"
              >
                <template
                  id="columnsSortableRepeater"
                  is="dom-repeat"
                  items="[[columns]]"
                  as="column"
                >
                  <paper-item label="[[column]]" class="column-item">
                    <paper-checkbox
                      checked="[[_isColumnVisible(column,visible)]]"
                      on-change="_checkboxChanged"
                      >[[column]]</paper-checkbox
                    >
                  </paper-item>
                </template>
              </sortable-list>
            </template>
          </div>
          <div class="buttons">
            <paper-button on-tap="_dismissDialog">Close</paper-button>
          </div>
        </template>
      </vaadin-dialog>

      <vaadin-dialog id="csvDialog" aria-label="styled">
        <template>
          <h2 class="dialog-title">Download list data in CSV</h2>
          <p>Select columns to download.</p>
          <div class="vaadin-dialog-scrollable">
            <template is="dom-repeat" items="[[columns]]" as="column">
              <paper-item label="[[column]]">
                <paper-checkbox checked="[[_isCsvVisible(column)]]" on-change="_CSVcheckboxChanged"
                  >[[column]]</paper-checkbox
                >
              </paper-item>
            </template>
          </div>
          <div class="buttons">
            <paper-button on-tap="_dismissDialog">Cancel</paper-button>
            <paper-button dialog-confirm="" autofocus="" on-tap="_exportCsv"
              >Download CSV</paper-button
            >
          </div>
        </template>
      </vaadin-dialog>
    </template>

    <div
      id="actions"
      hidden="[[!selectedItems.length]]"
      style$="width: [[headerWidth]]px; z-index: 99999;"
    >
      <mist-check selected="{{selectAll}}">[[selectedItems.length]]</mist-check>
      <mist-list-actions id="listActions" actions="[[actions]]"></mist-list-actions>
    </div>

    <vaadin-grid
      id="grid"
      data-provider="[[dataProvider]]"
      selected-items="{{selectedItems}}"
      loading="[[_loading]]"
      active-item="{{activeItem}}"
      on-active-item-changed="_activeItemChanged"
      selection-mode="multi"
      multi-sort="[[multiSort]]"
      theme$="[[theme]] no-row-borders row-stripes"
      actions$="[[!selectedItems.length]]"
    >
      <template class="row-details">
        <div class="details-cell">
          <div
            class="details"
            on-tap="_preventDefault"
            on-click="_preventDefault"
            on-pointerup="_preventDefault"
            on-mouseup="_preventDefault"
          >
            <json-viewer json="[[_stringify(item)]]"></json-viewer>
          </div>
        </div>
      </template>
      <template is="dom-if" if="[[selectable]]" restamp="">
        <vaadin-grid-selection-column
          flex-grow="0"
          frozen=""
          style="overflow: visible !important;"
          width="50px"
          z-index="5"
        >
          <template class="header">
            <mist-check selected="{{selectAll}}" hidden="[[selectedItems.length]]"
              >[[selectedItems.length]]</mist-check
            >
          </template>
          <template>
            <mist-check
              class="item-check"
              selected="{{selected}}"
              style$="[[_computeIndicatorStyle(item,renderers.indicator)]]"
              icon="[[_computeIcon(item, renderers.icon)]]"
              item="[[item]]"
            ></mist-check>
          </template>
        </vaadin-grid-selection-column>
      </template>
      <template is="dom-if" if="[[_or(expands, columnMenu)]]" restamp="">
        <vaadin-grid-column
          width="[[_computeMenuCellWidth(expands)]]"
          flex-grow="0"
          frozen=""
          style="z-index: -1"
        >
          <template class="header" style="z-index: -1">
            <paper-menu-button
              horizontal-align="left"
              vertical-align="top"
              vertical-offset="45"
              class="column-menu"
              style$="[[menuButtonStyle]]"
            >
              <paper-icon-button
                icon="icons:view-column"
                class="dropdown-trigger"
                alt="multi select"
                title="Select columns &amp; export CSV"
                slot="dropdown-trigger"
                style="height: 36px; width: 36px;"
              ></paper-icon-button>
              <paper-listbox class="dropdown-content" slot="dropdown-content">
                <paper-item on-tap="_openDialogSelectColumns">Select columns</paper-item>
                <paper-item on-tap="_openDialogExportCsv" disabled="[[!apiurl]]"
                  >Download CSV</paper-item
                >
              </paper-listbox>
            </paper-menu-button>
          </template>
          <template>
            <paper-icon-button
              icon="icons:arrow-drop-down"
              style$="[[_computeExpandIconStyle(item,selectable)]]; padding: 8px; width: 36px; height: 36px;"
              toggles=""
              active="{{detailsOpened}}"
              id="btn-[[_computeId(item)]]"
              hidden="[[!expands]]"
              on-active-changed="_toggleItemExpand"
            ></paper-icon-button>
          </template>
        </vaadin-grid-column>
      </template>
      <template is="dom-repeat" items="[[frozen]]" as="column">
        <vaadin-grid-column
          frozen=""
          resizable=""
          width="[[columnWidth(column,frozenWidth)]]"
          on-column-width-changed="_saveColumnWidth"
        >
          <template class="header" style="z-index: -10000" hidden="[[selectedItems.length]]">
            <vaadin-grid-sorter
              style="z-index: -10000"
              hidden="[[timeseries]]"
              path="[[column]]"
              direction="[[_getDirection(column)]]"
              cmp="[[_getComparisonFunction(column)]]"
              id="sorter-column-[[column]]"
              >[[_getTitle(column)]]</vaadin-grid-sorter
            >
            <span class="header" hidden="[[!timeseries]]">[[_getTitle(column)]]</span>
          </template>
          <template>
            <vaadin-grid-tree-toggle
              leaf="[[!item.hasChildren]]"
              expanded="{{expanded}}"
              level="[[level]]"
              hidden="[[!_is(column,treeHandleColumn)]]"
            >
              <div style="padding: 8px 0px;" inner-h-t-m-l="[[_getBody(column, item)]]"></div>
            </vaadin-grid-tree-toggle>
            <div
              style="padding: 8px 0px;"
              inner-h-t-m-l="[[_getBody(column, item)]]"
              hidden="[[_is(column,treeHandleColumn)]]"
            ></div>
          </template>
        </vaadin-grid-column>
      </template>

      <template is="dom-repeat" items="{{visible}}" as="column" restamp="">
        <vaadin-grid-column
          resizable=""
          width="[[columnWidth(column)]]"
          item-has-children-path="hasChildren"
          on-column-width-changed="_saveColumnWidth"
        >
          <template class="header">
            <vaadin-grid-sorter
              path="[[column]]"
              direction="[[_getDirection(column)]]"
              cmp="[[_getComparisonFunction(column)]]"
              hidden="[[timeseries]]"
              id="sorter-column-[[column]]"
              >[[_getTitle(column)]]</vaadin-grid-sorter
            >
            <span class="header" hidden="[[!timeseries]]">[[_getTitle(column)]]</span>
          </template>
          <template>
            <vaadin-grid-tree-toggle
              leaf="[[!item.hasChildren]]"
              expanded="{{expanded}}"
              level="[[level]]"
              hidden="[[!_is(column,treeHandleColumn)]]"
            >
              <div style="padding: 8px 0px;" inner-h-t-m-l="[[_getBody(column, item)]]"></div>
            </vaadin-grid-tree-toggle>
            <div
              style="padding: 8px 0px;"
              inner-h-t-m-l="[[_getBody(column, item)]]"
              hidden="[[_is(column,treeHandleColumn)]]"
            ></div>
          </template>
        </vaadin-grid-column>
      </template>

      <template is="dom-if" if="[[!hasVisibleColumns]]" restamp="">
        <template is="dom-repeat" items="[[columns]]" as="column">
          <vaadin-grid-column
            resizable=""
            width="[[columnWidth(column)]]"
            on-column-width-changed="_saveColumnWidth"
          >
            <template class="header">
              <vaadin-grid-sorter
                path="[[column]]"
                direction="[[_getDirection(column)]]"
                cmp="[[_getComparisonFunction(column)]]"
                hidden="[[timeseries]]"
                id="sorter-column-[[column]]"
                >[[_getTitle(column)]]</vaadin-grid-sorter
              >
              <span class="header" hidden="[[!timeseries]]">[[_getTitle(column)]]</span>
            </template>
            <template>
              <div style="padding: 8px 0px;" inner-h-t-m-l="[[_getBody(column, item)]]"></div>
            </template>
          </vaadin-grid-column>
        </template>
      </template>
    </vaadin-grid>

    <div class="nodata" hidden="[[!showNoData]]">
      <slot name="no-items-found"></slot>
    </div>

    <iron-ajax
      id="getCsv"
      method="GET"
      loading="{{loadingCSV}}"
      on-request="_csvRequest"
      on-response="_csvResponse"
      on-error="_csvError"
      handle-as="txt"
    ></iron-ajax>

    <a
      id="downloadCSV"
      href="data:application/octet-stream;[[CSVresponse]]"
      download="[[_computeCSVname(apiurl)]]"
      hidden=""
      >Download</a
    >
  `,

  is: 'mist-list',

  properties: {
    id: {
      type: String,
      reflectToAttribute: true,
    },

    name: {
      type: String,
      reflectToAttribute: true,
    },

    apiurl: {
      type: String,
    },

    items: {
      type: Array,
    },

    filteredItems: {
      type: Array,
      value() {
        return [];
      },
    },

    count: {
      type: Number,
      value: 0,
      notify: true,
    },

    autoHide: {
      type: Boolean,
      value: false,
    },

    hidden: {
      type: Boolean,
      computed: '_computeHidden(autoHide, count, editingFilter)',
      reflectToAttribute: true,
    },

    columns: {
      type: Array,
      value() {
        return [];
      },
    },

    colmap: {
      type: Object,
      value() {
        return {};
      },
    },

    frozen: {
      type: Array,
      value() {
        return [];
      },
    },

    visible: {
      type: Array,
    },

    hasVisibleColumns: {
      type: Boolean,
      computed: '_hasVisibleColumns(visible.length)',
    },

    CSVvisible: {
      type: Array,
    },

    filterMethod: {
      type: Object,
      value() {
        return {};
      },
    },

    renderers: {
      type: Object,
      value() {
        return {};
      },
    },

    selectedItems: {
      type: Array,
      value() {
        return [];
      },
      notify: true,
    },

    selectAll: {
      type: Boolean,
      value: false,
    },

    primaryFieldName: {
      type: String,
      value: 'id',
    },

    sortOrder: {
      type: Array,
      value() {
        return [];
      },
    },

    multiSort: {
      type: Boolean,
      value: false,
    },

    route: {
      type: Object,
      notify: true,
    },

    expands: {
      type: Boolean,
      value: false,
    },

    toolbar: {
      type: Boolean,
      value: false,
      reflectToAttribute: true,
    },

    columnMenu: {
      type: Boolean,
      value: false,
    },

    itemMap: {
      type: Object,
    },

    timeseries: {
      type: Boolean,
      value: false,
    },

    selectable: {
      type: Boolean,
      value: false,
    },

    resizable: {
      type: Boolean,
      value: false,
    },

    searchable: {
      type: Boolean,
      value: false,
    },

    editingFilter: {
      type: Boolean,
      value: false,
    },

    baseFilter: {
      type: String,
      value: '',
    },

    userFilter: {
      type: String,
    },

    combinedFilter: {
      type: String,
    },

    streaming: {
      type: Boolean,
      value: false,
      reflectToAttribute: true,
    },

    infinite: {
      type: Boolean,
      value: false,
    },

    finished: {
      type: Boolean,
      value: false,
    },

    frozenWidth: {
      type: Number,
      value: 200,
    },

    showNoData: {
      type: Boolean,
      value: false,
    },

    filteredItemsLength: {
      type: Number,
      computed: '_computeFilteredItemsLength(filteredItems)',
      notify: true,
    },

    sorters: {
      type: Array,
      value() {
        return [];
      },
    },

    enableFullscreen: {
      type: Boolean,
      value: true,
    },

    fullscreen: {
      type: Boolean,
      value: false,
      reflectToAttribute: true,
    },

    presetFilters: {
      type: Array,
      value() {
        return [];
      },
    },

    headerWidth: {
      type: Number,
    },

    rest: {
      type: Boolean,
      value: false,
    },

    theme: {
      type: String,
      reflectToAttribute: true,
      value: 'compact',
    },

    _loading: {
      // grid defined by data provider
      type: Boolean,
    },

    loading: {
      // parent defined
      type: Boolean,
    },

    justAttached: {
      type: Boolean,
      value: true,
    },

    csrfToken: {
      type: String,
      value: '',
    },

    menuButtonStyle: {
      type: String,
      value: '',
    },

    treeHandleColumn: {
      type: String,
      value: '',
    },
  },

  observers: [
    '_updateMenuButtonStyle(selectable, columnMenu, selectedItemsLength, count)',
    '_itemsUpdated(items)',
    '_itemMapUpdated(itemMap.*)',
    '_filterItems(items, items.length, combinedFilter, filterMethod)',
    '_selectedItemsChanged(selectedItems.length)',
    '_selectAllToggled(selectAll)',
    '_updateShowNoData(items.length, filteredItems.length, loading, _loading, justAttached)',
    '_visibleChanged(visible)',
    '_updateTreeHandleColumn(visible,frozen)',
  ],

  listeners: {
    'action-finished': '_clearSelection',
    'receive-log': 'eventReceived',
    resize: '_windowResize',
    'column-width-changed': '_saveColumnWidth',
    'sorter-changed': '_sorterChanged',
  },

  attached() {
    const _this = this;
    if (this.resizable) {
      // eslint-disable-next-line func-names
      this.resizeHandler = function() {
        _this._debounceResize();
      };
      window.addEventListener('resize', this.resizeHandler);
      this._debounceResize();
      // eslint-disable-next-line func-names
      this.async(function() {
        this.fire('resize');
      }, 1000);
    }

    if (this.infinite) {
      this.listen(this.querySelector('vaadin-grid'), 'wheel', '_onWheel');
    }

    try {
      if (JSON.parse(localStorage.getItem(`mist-list#${this.id}`))) {
        this.set('visible', JSON.parse(localStorage.getItem(`mist-list#${this.id}`)));
      }

      const sorters = JSON.parse(localStorage.getItem(`mist-list#${this.id}/sorters`));
      if (sorters && sorters.length) this.set('sorters', sorters);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('Failed to access localStorage: ', e);
    }

    this.fire('list-attached', {
      id: this.id,
    });
    this.set('headerWidth', this.$.grid.$.header.clientWidth);

    if (this.streaming) {
      this.fire('streaming-list-attached', this);
    }

    setTimeout(() => {
      this.set('justAttached', false);
    }, 4000);
  },

  detached() {
    if (this.resizable) {
      window.removeEventListener('resize', this.resizeHandler);
    }
    if (this.streaming) {
      this.fire('streaming-list-detached', this);
    }
  },

  _updateTreeHandleColumn(visible, frozen) {
    let col = frozen ? frozen[0] : visible && visible[0];
    if (!col) {
      col = this.columns && this.columns[0];
    }
    this.set('treeHandleColumn', col);
  },

  _toggleItemExpand(e) {
    // console.log('_toggleItemExpand', e);
    if (e.target.active) {
      this.$.grid.openItemDetails(e.target.__dataHost.item);
    } else {
      this.$.grid.closeItemDetails(e.target.__dataHost.item);
    }
  },

  _computeGridWidth() {
    return `${this.$.grid.$.header.clientWidth}px`;
  },

  _itemMapUpdated() {
    if (this.itemMap && !this.rest) {
      const that = this;
      this.debounce(
        'updateItemsList',
        () => {
          that.set('items', Object.values(that.itemMap));
        },
        300,
      );
    }
  },

  _computeFilteredItemsLength(filteredItems) {
    return filteredItems ? filteredItems.length : 0;
  },

  _updateShowNoData(_loading, justAttached) {
    if (
      (!(this.loading || this._loading) && !this.items) ||
      (this.items && !this.items.length) ||
      (this.filteredItems && !this.filteredItems.length)
    ) {
      this.set('showNoData', !justAttached);
    } else {
      this.set('showNoData', false);
    }
  },

  _onWheel() {
    const t = this.$.grid.scrollTarget;
    if (t && (t.scrollTop + t.clientHeight) / t.scrollHeight > 0.8 && !this.finished) {
      const pageno = this.$.grid._getPageForIndex(this.count);
      // console.log('request page', pageno);
      this.$.grid._loadPage(pageno, this.$.grid._cache);
    }
  },

  _debounceResize() {
    // eslint-disable-next-line func-names
    this.debounce(
      'resize',
      function() {
        this.fire('resize');
      },
      500,
    );
  },

  _windowResize() {
    if (!this.resizable) {
      return;
    }
    let { top } = this.getBoundingClientRect();
    let newHeight;
    const itemsHeight = ((this.$.grid.items && this.$.grid.items.length) || 0) * 56;
    const outerScroller = this.$.grid.$.outerscroller;
    const hasVerticalScroll = outerScroller.scrollWidth > outerScroller.clientWidth;
    let heightOffset = 36;
    // Calculate and add the height of the content slotted in the header, so
    // it does not push mist-list below visible height.
    const headerSlotElements = this.$.slottedHeader.assignedElements();
    if (headerSlotElements.length) {
      // eslint-disable-next-line no-plusplus
      for (let i = 0; i < headerSlotElements.length; i++) {
        top += headerSlotElements[i].getBoundingClientRect().height;
      }
    }
    if (hasVerticalScroll) {
      heightOffset += 19;
    }
    if (this.toolbar)
      newHeight = Math.min(window.innerHeight - top - 80, itemsHeight + heightOffset);
    else newHeight = Math.min(window.innerHeight - top - 36, itemsHeight + heightOffset);
    if (
      this.$.grid.$.items.scrollWidth > itemsHeight &&
      this.$.grid.$.items.scrollHeight <= this.scrollHeight
    )
      newHeight += 16;
    this.style.height = `${newHeight}px`;
    this.updateHeaderWidth();
  },

  columnWidth(column, frozen) {
    let w;
    try {
      w = localStorage.getItem(`mist-list#${this.id}/col/${column}/width`);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn(e);
    }
    if (w) {
      return w;
    }
    if (frozen) {
      return `${this.frozenWidth}px`;
    }
    return '120px';
  },

  _saveColumnWidth(e) {
    // eslint-disable-next-line func-names
    this.debounce(
      'debounceWidthChanges',
      function() {
        const column = e.model ? e.model.column : null;
        if (column) {
          localStorage.setItem(`mist-list#${this.id}/col/${e.model.column}/width`, e.detail.width);
        }
      },
      500,
    );
  },

  _saveColumnOrder() {
    localStorage.setItem(`mist-list#${this.id}/column-order`, this.visible.reverse());
  },

  _filterItems() {
    // console.log('filterItems', filter, this.id);
    if (this.items) {
      // eslint-disable-next-line func-names
      this.debounce(
        '_filterListItems',
        function() {
          // console.log('filterItems exec', filter, this.id);
          const newItems = this.items.filter(this._applyFilter.bind(this));
          this.set('filteredItems', newItems);
          this.fire('mist-list-filtered-items-length-changed', {
            length: this.filteredItems.length,
          });
          this.$.grid.set('items', this.filteredItems);
          // eslint-disable-next-line func-names
          this.async(function() {
            this.fire('resize');
          }, 200);

          if (this.selectedItems.length) {
            // eslint-disable-next-line func-names
            this.debounce(
              'cleanupSelectedItems',
              function() {
                const newSelectedItems = [];
                const _this = this;
                // eslint-disable-next-line vars-on-top
                // eslint-disable-next-line no-plusplus
                for (let i = 0; i < _this.selectedItems.length; i++) {
                  const j = this.filteredItems.findIndex(
                    item => item.id === _this.selectedItems[i].id,
                  );
                  if (j > -1) newSelectedItems.push(this.filteredItems[j]);
                }
                this.set('selectedItems', newSelectedItems);
                // eslint-disable-next-line func-names
                this.async(function() {
                  this.fire('resize');
                }, 100);
              },
              200,
            );
          } else {
            // eslint-disable-next-line func-names
            this.debounce(
              'iron-resize',
              function() {
                this.$.grid.fire('iron-resize');
              },
              100,
            );
          }
        },
        500,
      );
    }
  },

  _applyFilter(item) {
    let q = this.combinedFilter ? this.combinedFilter.slice(0) : '';
    let queryTerms;
    if (this.filterMethod.apply) {
      const response = this.filterMethod.apply(item, q);
      // response can be false or a query stripped of owner filter
      if (response === false) {
        return false;
      }
      q = this.filterMethod.apply(item, q);
    }
    if (q.length) {
      // TODO: properly filter parenthesis
      queryTerms = q
        .replace(/\(/g, '')
        .replace(/\)/g, '')
        .replace(/ AND /g, ' ')
        .replace(/ OR /g, ' ')
        .split(' ');

      // Check if all terms exist in item
      // eslint-disable-next-line no-plusplus
      for (let i = 0; i < queryTerms.length; i++) {
        if (queryTerms[i] && queryTerms[i].length)
          if (queryTerms[i].indexOf(':') > -1) {
            const kv = queryTerms[i].split(':');
            const k = kv[0];
            const v = kv[1];
            if (item[k] !== v) {
              // check also rendered values
              if (
                this.columns.indexOf(k) > -1 &&
                this._getBody(k, item)
                  .toLowerCase()
                  .indexOf(v.toLowerCase()) > -1
              ) {
                return true;
              }
              return false;
            }
          } else if (
            this._getRenderedItem(item)
              .toLowerCase()
              .indexOf(queryTerms[i].toLowerCase()) < 0
          ) {
            return false;
          }
      }
    }
    return true;
  },

  _getRenderedItem(item) {
    let renderedFields = '';
    if (this.renderers && this.columns) {
      // eslint-disable-next-line no-plusplus
      for (let i = 0; i < this.columns.length; i++) {
        renderedFields += ` ${this._getBody(this.columns[i], item)}`;
      }
    }
    return `${renderedFields} ${JSON.stringify(item)}`;
  },

  _itemsUpdated() {
    // console.log('_itemsUpdated', this.items && this.items.length);
    if (this.items) {
      this.set('received', this.items.length);
      this.set('count', this.items.length);
    }
    if (this.items && this.items.length) {
      // update column map using response.items values
      // eslint-disable-next-line no-plusplus
      for (let i = 0; i < this.items.length; i++) {
        const item = this.items[i];
        if (this.rest) this.itemMap[item[this.primaryFieldName]] = item;
        const keys = item ? Object.keys(item) : [];
        // eslint-disable-next-line no-plusplus
        for (let k = 0; k < keys.length; k++) {
          this.colmap[keys[k]] = true;
        }
      }
      const cols = Object.keys(this.colmap);
      // Add the visible columns if any that are not an item property
      if (this.visible && this.visible.length) {
        // eslint-disable-next-line no-plusplus
        for (let j = 0; j < this.visible.length; j++) {
          if (cols.indexOf(this.visible[j]) === -1) {
            cols.push(this.visible[j]);
          }
        }
      }
      // Compute columns list from colmap, removing frozen columns
      this.frozen.forEach(f => {
        if (cols.indexOf(f) > -1) cols.splice(cols.indexOf(f), 1);
      });
      this.set('columns', cols);
    }
  },

  _activeItemChanged(e) {
    const grid = e.target;
    this._clickedItem = grid && grid.activeItem ? grid.activeItem : this._clickedItem;
    // we should either redirect to the proper route path, or expand the item
    if (this._clickedItem) {
      if (this.route !== undefined)
        this.set('route.path', this._clickedItem[this.primaryFieldName]);
    }
  },

  _getTitle(column) {
    if (this.renderers[column] && this.renderers[column].title) {
      if (typeof this.renderers[column].title === 'function') return this.renderers[column].title();
      return this.renderers[column].title;
    }
    return column;
  },

  _getBody(column, item) {
    if (item) {
      if (this.renderers[column]) return this.renderers[column].body(item[column], item);
      if (typeof item[column] === 'undefined') return '&nbsp;';
      if (typeof item[column] === 'string') return item[column];

      const ret = JSON.stringify(item[column]);
      if (['undefined', '[]', '{}'].indexOf(ret) === -1) return ret;
    }
    return '&nbsp;';
  },

  _stringify(item) {
    return JSON.stringify(item, null, 2);
  },

  _isColumnVisible(column) {
    return this.visible && this.visible.indexOf(column) > -1;
  },

  _isCsvVisible(column) {
    return this.CSVvisible && this.CSVvisible.indexOf(column) > -1;
  },

  _getSelectedColumnsIndexArray() {
    if (!this.visible) return [];
    const ret = [];
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < this.visible.length; i++) ret.push(this.columns.indexOf(this.visible[i]));
    // console.log('_getSelectedColumnsIndexArray returning', ret);
    return ret;
  },

  _hasReceivedAll() {
    return this.received >= this.count;
  },

  _onSortStart() {
    // this.shadowRoot.querySelector('vaadin-dialog-scrollable')
  },

  _onSortFinish() {
    const newOrder = [];
    const overlay = document.getElementById('overlay');
    const content = overlay.shadowRoot.querySelector('div[part="content"]');
    const list = content.shadowRoot.querySelector('sortable-list');
    const elements = list.querySelectorAll('paper-item');

    elements.forEach(el => {
      if (
        el.querySelector('paper-checkbox[checked]') &&
        el.querySelector('paper-checkbox[checked]') &&
        el.querySelector('paper-checkbox[checked]').textContent
      ) {
        newOrder.push(el.querySelector('paper-checkbox').textContent.trim());
      }
    });

    this.set('visible', newOrder);
    this._saveVisibleColumns();
  },

  _checkboxChanged(e) {
    // console.log('_checkboxChanged', e.model.column, e.target.active, e.model.item);
    if (e.target.active && this.visible.indexOf(e.model.column) === -1) {
      this.push('visible', e.model.column);
      // let the saving be order dependent
      this._onSortFinish();
    } else if (!e.target.active && this.visible.indexOf(e.model.column) > -1) {
      this.splice('visible', this.visible.indexOf(e.model.column), 1);
      this._saveVisibleColumns();
    }
  },

  _saveVisibleColumns() {
    localStorage.setItem(`mist-list#${this.id}`, JSON.stringify(this.visible));
  },

  _CSVcheckboxChanged(e) {
    if (e.target.active && this.CSVvisible.indexOf(e.model.column) === -1) {
      this.push('CSVvisible', e.model.column);
    } else if (!e.target.active && this.CSVvisible.indexOf(e.model.column) > -1) {
      this.splice('CSVvisible', this.CSVvisible.indexOf(e.model.column), 1);
    }
  },

  _selectAllToggled(selectAll) {
    if (selectAll && this.count !== this.selectedItems.length) {
      this.set('selectedItems', this.filteredItems);
    } else if (!selectAll && this.count === this.selectedItems.length) {
      this.set('selectedItems', []);
    }
  },

  _selectedItemsChanged(itemslength) {
    if (this.count && this.count === itemslength && !this.selectAll) {
      this.set('selectAll', true);
    } else if (this.count && this.count !== itemslength && this.selectAll) {
      this.set('selectAll', false);
    }
    this.updateHeaderWidth();
  },

  _getComparisonFunction(column) {
    return this.renderers[column] && this.renderers[column].cmp;
  },

  _computeExpandIconStyle(item, selectable) {
    // TODO: animate icon
    if (!item) return 'display:none';
    let ret = '';
    if (selectable) ret += 'margin-left: -8px;';
    else ret += 'margin-left: 4px;';
    if (!item.expanded) ret += 'transform: rotate(270deg);';
    // console.log('_computeExpandIconStyle', this.columnMenu, selectable, ret);
    return ret;
  },

  _computeIndicatorStyle(item, indicator) {
    if (!indicator) return '';
    return this._getBody('indicator', item);
  },

  _computeIcon(item, icon) {
    if (!icon || !item || !this.renderers.icon) return '';
    return this.renderers.icon.body(item, item) || '';
  },

  _computeId(item) {
    if (!item) return '';
    return item[this.primaryFieldName];
  },

  eventReceived(item) {
    if (!this.streaming) return;
    // console.debug('eventReceived', item, this._applyFilter(item.detail));
    if (this._applyFilter(item.detail))
      // eslint-disable-next-line func-names
      this.async(function() {
        if (this.$.grid && this.$.grid.get('_cache.items') !== undefined) {
          this.$.grid._cache.size += 1;
          this.$.grid._cache.effectiveSize += 1;
          // eslint-disable-next-line no-plusplus
          for (let i = Object.keys(this.$.grid._cache.items).length; i > 0; i--) {
            this.$.grid._cache.items[i] = this.$.grid._cache.items[i - 1];
          }
          this.$.grid._cache.items[0] = item.detail;
          this.$.grid.fire('iron-resize');
        }
      });
  },

  _updateMenuButtonStyle(selectable, columnMenu, selectedItemsLength, count) {
    let ret;
    if (!columnMenu || selectedItemsLength || !count) ret = 'display: none';
    else if (selectable) ret = 'margin-left: -8px;';
    else ret = 'margin-left: 4px;';
    // console.log('_updateMenuButtonStyle', selectable, columnMenu, selectedItemsLength, count, ret);
    this.set('menuButtonStyle', ret);
  },

  _or(a, b) {
    return !!(a || b);
  },

  _preventDefault(e) {
    e.preventDefault();
  },

  _computeHidden(autoHide, count, editingFilter) {
    return autoHide && !count && !editingFilter && !this.userFilter;
  },

  _computeMenuCellWidth(expands) {
    return (expands && '46px') || '36px';
  },

  _openDialogSelectColumns() {
    this.shadowRoot.querySelector('#columnsDialog').opened = true;
  },

  _openDialogExportCsv() {
    this.shadowRoot.querySelector('#csvDialog').opened = true;
  },

  _exportCsv() {
    this.$.getCsv.headers['Csrf-Token'] = this.csrf_token;
    this.$.getCsv.headers.Accept = 'text/csv';
    this.$.getCsv.url = `${this.apiurl}?columns=${this.frozen.concat(this.CSVvisible).join()}`;
    this.$.getCsv.generateRequest();
  },

  _csvRequest() {
    this.fire('export-list-csv', {
      message: 'Requesting CSV.',
    });
  },

  _computeCSVname(str) {
    const ch = str.split('/');
    return `${ch[ch.length - 1]}-list.csv`;
  },

  _csvResponse(e) {
    this.set('CSVresponse', e.detail.xhr.response);
    this._downloadFile();
  },

  _downloadFile() {
    this.shadowRoot.querySelector('#downloadCSV').click();
    this.set('CSVresponse', '');
  },

  _csvError(e) {
    // eslint-disable-next-line no-console
    console.log('_csvError', e);
    this.fire('export-list-csv', {
      message: `Error in CSV.${e.detail.error}`,
    });
  },

  _visibleChanged(visible) {
    // console.log('visible changed', this.visible);
    this.set('CSVvisible', this.CSVvisible || visible);
  },

  _sorterChanged(event) {
    // eslint-disable-next-line func-names
    this.debounce(
      '_updateSorters',
      function() {
        // console.debug('_updateSorters');
        this.set(
          'sortOrder',
          this.$.grid._sorters.map(x => [x.path, x.direction]),
        );
        try {
          localStorage.setItem(`mist-list#${this.id}/sorters`, JSON.stringify(this.sortOrder));
        } catch (e) {
          // eslint-disable-next-line no-console
          console.warn(e);
        }
      },
      500,
    );
    event.stopPropagation();
  },

  _getDirection(column) {
    if (this.sorters) {
      // eslint-disable-next-line no-plusplus
      for (let i = 0; i < this.sorters.length; i++) {
        if (this.sorters[i][0] === column) return this.sorters[i][1];
      }
    }
    return undefined;
  },

  _enterFullscreen() {
    this.set('fullscreen', true);
    this.updateHeaderWidth();
    this.fire('enter-fullscreen');
  },

  _exitFullscreen() {
    this.set('fullscreen', false);
    this.updateHeaderWidth();
    this.fire('exit-fullscreen');
  },

  updateHeaderWidth() {
    this.set('headerWidth', this.$.grid.$.header.clientWidth);
    if (this.$.listActions) this.$.listActions.fire('list-resize');
  },

  _dismissDialog() {
    const dialogs = this.shadowRoot.querySelectorAll('vaadin-dialog') || [];
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < dialogs.length; i++) {
      if (dialogs[i].opened) {
        dialogs[i].opened = false;
        return;
      }
    }
  },

  _clearSelection() {
    this.selectedItems = [];
  },

  _hasVisibleColumns() {
    if (this.visible && this.visible.length > 0) return true;
    return false;
  },

  _is(a, b) {
    return a === b;
  },
});
