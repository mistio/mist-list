import '@polymer/polymer/polymer-legacy.js';
import '@polymer/paper-menu-button/paper-menu-button.js';
import '@polymer/paper-input/paper-input.js';
import '@polymer/paper-item/paper-item.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/paper-listbox/paper-listbox.js';
import '@polymer/iron-icons/iron-icons.js';
import '@vaadin/vaadin-dialog/vaadin-dialog.js';
import { Polymer } from '@polymer/polymer/lib/legacy/polymer-fn.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';

Polymer({
  _template: html`
    <style>
      [hidden] {
        display: none !important;
      }

      :host {
        display: inherit;
      }

      span.title {
        font-size: 18px !important;
        text-transform: capitalize;
        font-weight: 500;
        opacity: 0.7;
      }

      h2.titleh2 {
        line-height: 1.1em !important;
        margin: var(--mist-filter-h2-title-margin);
        width: 100%;
      }

      #form {
        display: inherit;
        max-height: 48px;
        flex: 1 100%;
      }

      paper-input#searchInput {
        width: 100%;
        top: -13px;
        padding-left: 8px;
        --paper-input-container-input: {
          font-size: 16px;
          color: inherit;
          width: 100%;
          padding: 5px 0;
        }
      }

      paper-item paper-icon-button {
        transform: scale(0.7);
        opacity: 0.54;
      }

      paper-icon-button#saveFilterBtn,
      paper-icon-button#clearFilterBtn {
        display: inline-flex;
        align-self: center;
        margin-top: var(--mist-filter-paper-buttons-margin-top);
      }

      paper-menu-button {
        padding: var(--mist-filter-paper-menu-button-padding);
        max-height: 48px;
      }

      paper-menu-button paper-button {
        background-color: var(--mist-filter-paper-menu-button-background-color);
        margin: var(--mist-filter-paper-menu-button-paper-button-margin);
        padding-left: var(--mist-filter-paper-menu-button-paper-button-padding-left);
        text-transform: var(--mist-filter-paper-menu-button-paper-button-text-transform);
        font-size: var(--mist-filter-paper-menu-button-paper-button-font-size);
      }

      iron-icon[icon='search'] {
        padding: 12px 8px 8px 0px;
        align-self: var(--mist-filter-iron-icon-search-align-self);
        opacity: 0.5;
      }

      .buttons {
        display: flex;
        justify-content: flex-end;
        padding: 24px 0;
      }

      h2.dialog-title {
        font-size: 20px;
        font-weight: 500;
      }
    </style>

    <paper-menu-button
      id="presetFilters"
      horizontal-align="left"
      vertical-align="top"
      vertical-offset="40"
      hidden="[[!combinedPresetFilters.length]]"
    >
      <template is="dom-if" if="[[!_showButton(buttonName)]]" restamp="">
        <paper-icon-button
          icon="filter-list"
          slot="[[_computeSlot(buttonName,'icon')]]"
          class="dropdown-trigger"
          alt="select filter"
          title="Select preset filters"
          style="margin-left: -10px; margin-right: 4px"
          hidden="[[buttonName.length]]"
        ></paper-icon-button>
      </template>
      <template is="dom-if" if="[[_showButton(buttonName)]]" restamp="">
        <paper-button
          class="dropdown-trigger"
          slot="[[_computeSlot(buttonName,'button')]]"
          hidden="[[!buttonName.length]]"
          style="height: 48px;"
        >
          [[buttonName]]<iron-icon icon="icons:arrow-drop-down"></iron-icon>
        </paper-button>
      </template>
      <paper-listbox
        id="filterSelect"
        slot="dropdown-content"
        class="dropdown-content"
        attr-for-selected="id"
        selected="{{selectedPresetFilter}}"
      >
        <paper-item id="" class="filter all-items" @tap="_clearFilter"
          ><span>[[name]]</span></paper-item
        >
        <template is="dom-repeat" items="[[combinedPresetFilters]]">
          <paper-item id="[[item.filter]]" class="filter">
            <paper-item-body>[[item.name]]</paper-item-body>
            <paper-icon-button
              class="clear-filter"
              icon="icons:delete"
              title="Delete filter"
              @tap="_deletePresetFilter"
              hidden="[[item.default]]"
            ></paper-icon-button>
          </paper-item>
        </template>
      </paper-listbox>
    </paper-menu-button>

    <div id="form" @tap="_startEditingFilter">
      <iron-icon icon="search" hidden="[[!searchable]]"></iron-icon>
      <slot name="count"></slot>
      <h2 class="titleh2" hidden="[[_showFilterInput(editingFilter,alwaysShowInput)]]">
        <span class="title">
          [[displayName]]
        </span>
      </h2>
      <paper-input
        id="searchInput"
        hidden="[[!_showFilterInput(editingFilter,alwaysShowInput)]]"
        @focused-changed="_searchInputFocusedChanged"
        @keydown="_keyDownSearchInput"
        tabindex="1"
        value="{{userFilter}}"
        no-label-float=""
        placeholder="[[name]]"
      >
      </paper-input>
    </div>
    <paper-icon-button
      icon="close"
      hidden="[[_hideClearButton(editingFilter,userFilter.length)]]"
      @tap="_clearFilterAndFocus"
      id="clearFilterBtn"
    ></paper-icon-button>
    <paper-icon-button
      @tap="_openDialogSaveFilter"
      icon="icons:save"
      hidden="[[!showSaveSearch]]"
      id="saveFilterBtn"
      >save filter</paper-icon-button
    >
    <vaadin-dialog id="filterDialog" aria-label="styled">
      <template>
        <h2 class="dialog-title">Save filter</h2>
        <div class="vaadin-dialog-scrollable">
          <span>Optionally choose a filter name.</span>
          <paper-input
            id="filterName"
            value="{{filterName}}"
            label="Filter name"
            tabindex="1"
            autofocus=""
            @keydown="_keyDownFilterName"
          ></paper-input>
        </div>
        <div class="buttons">
          <paper-button @tap="_dismissFilterDialog">Cancel</paper-button>
          <paper-button dialog-confirm="" @tap="_saveFilter" class="confirm">Save</paper-button>
        </div>
      </template>
    </vaadin-dialog>
  `,

  is: 'mist-filter',

  properties: {
    name: {
      type: String,
      reflectToAttribute: true,
    },

    buttonName: {
      type: String,
      value: false,
    },

    editingFilter: {
      type: Boolean,
      value: false,
    },

    alwaysShowInput: {
      type: Boolean,
      value: false,
      reflectToAttribute: true,
    },

    baseFilter: {
      type: String,
      value: '',
    },

    userFilter: {
      type: String,
      notify: true,
    },

    combinedFilter: {
      type: String,
      computed: '_computeFilter(baseFilter, userFilter)',
      notify: true,
    },

    presetFilters: {
      type: Array,
      value() {
        return [];
      },
      observer: '_presetFiltersUpdated',
    },

    userSavedFilters: {
      type: Array,
      value() {
        return [];
      },
    },

    combinedPresetFilters: {
      type: Array,
      value() {
        return [];
      },
      computed:
        '_computeCombinedPresetFilters(presetFilters,userSavedFilters,userSavedFilters.length)',
    },

    selectedPresetFilter: {
      type: String,
      value: '',
      observer: '_selectedPresetFilterChanged',
    },

    filterName: {
      type: String,
    },

    searchable: {
      type: Boolean,
      value: true,
    },

    showSaveSearch: {
      type: Boolean,
      computed: '_computeShowSaveSearch(userFilter,combinedPresetFilters.length)',
    },

    displayName: {
      type: String,
      computed: '_displayName(name,selectedPresetFilter,userFilter,combinedPresetFilters)',
      notify: true,
    },
  },

  observers: [
    '_userFilterChanged(combinedFilter)',
    '_resetUserFilter(name)',
    // '_fetchSavedFilter(presetFilters, name)'
  ],

  attach() {
    this._presetFiltersUpdated();
  },

  _fetchSavedFilter() {
    // console.warn('_fetchSavedFilter', this.id, this.name);

    let currentFilterKey;
    let savedFiltersKey;
    let filterValue;
    if (this.name) {
      currentFilterKey = `mist-filter#${this.id}/${this.name
        .toLowerCase()
        .replace(' ', '-')}/userFilter`;
      savedFiltersKey = `mist-filter#${this.id}/${this.name
        .toLowerCase()
        .replace(' ', '-')}/userSavedFilters`;
    } else {
      currentFilterKey = `mist-filter#${this.id}/userFilter`;
      savedFiltersKey = `mist-filter#${this.id}/userSavedFilters`;
    }
    const currentFilterFallbackKey = `mist-filter#${this.id}/all-resources/userFilter`;

    try {
      if (localStorage.getItem(currentFilterKey) !== undefined) {
        filterValue = localStorage.getItem(currentFilterKey);
      } else if (localStorage.getItem(currentFilterFallbackKey)) {
        filterValue = localStorage.getItem(currentFilterFallbackKey);
        localStorage.setItem(currentFilterKey, filterValue);
      } else {
        filterValue = '';
      }
      this.set('userFilter', filterValue);
      // console.log('get userFilter', this.id, this.name, this.userFilter);
      this.$.filterSelect.select(this.userFilter);
      // let display input if there is a query stored, which dows not belong to saved filters
      if (
        !this.$.filterSelect.selectedItem ||
        this.$.filterSelect.selectedItem.filter !== this.userFilter
      ) {
        this.set('editingFilter', true);
      }

      if (JSON.parse(localStorage.getItem(savedFiltersKey))) {
        this.set('userSavedFilters', JSON.parse(localStorage.getItem(savedFiltersKey)));
        this.dispatchEvent(new CustomEvent('filter-change', { bubbles: true, composed: true }));
      } else {
        this.set('userSavedFilters', []);
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('Failed to access localStorage: ', e);
    }
  },

  _presetFiltersUpdated() {
    // console.warn('_presetFiltersUpdated', e, this.id, this.name);
    if (this.name && this.presetFilters && !this.userFilter && this.searchable) {
      this._fetchSavedFilter();
      this.set('editingFilter', false);
    }
  },

  _selectedPresetFilterChanged() {
    if (this.searchable) {
      this.set('userFilter', this.selectedPresetFilter);
      this.dispatchEvent(new CustomEvent('filter-change', { bubbles: true, composed: true }));
    }
  },

  addFilter(filter) {
    let savedFiltersKey;
    if (this.name) {
      savedFiltersKey = `mist-filter#${this.id}/${this.name
        .toLowerCase()
        .replace(' ', '-')}/userSavedFilters`;
    } else {
      savedFiltersKey = `mist-filter#${this.id}/userSavedFilters`;
    }
    this.push('userSavedFilters', filter);
    localStorage.setItem(savedFiltersKey, JSON.stringify(this.userSavedFilters));
    this.dispatchEvent(new CustomEvent('filter-change', { bubbles: true, composed: true }));
    this.set('editingFilter', false);
  },

  deleteFilter(index) {
    let savedFiltersKey;
    if (this.name) {
      savedFiltersKey = `mist-filter#${this.id}/${this.name
        .toLowerCase()
        .replace(' ', '-')}/userSavedFilters`;
    } else {
      savedFiltersKey = `mist-filter#${this.id}/userSavedFilters`;
    }
    this.splice('userSavedFilters', index, 1);
    localStorage.setItem(savedFiltersKey, JSON.stringify(this.userSavedFilters));
    this.dispatchEvent(new CustomEvent('filter-change', { bubbles: true, composed: true }));
  },

  useFilter(filter) {
    if (typeof filter === 'object' && filter.filter) {
      this.set('userFilter', filter.filter);
    }
    if (typeof filter === 'string') {
      this.set('userFilter', filter);
    }
    this.set('selectedPresetFilter', this.userFilter);
  },

  _displayName(name, selectedPresetFilter, userFilter) {
    if (!this.selectedPresetFilter || !this.selectedPresetFilter.length) {
      return this.name && this.name.length ? this.name : 'All';
    }
    const that = this;
    const filter = this.combinedPresetFilters.find(f => that.selectedPresetFilter === f.filter);
    if (filter) {
      return filter.name;
    }
    return this.name ? `"${userFilter}"${this.name.replace('All', '')}` : `"${userFilter}"`;
  },

  _openDialogSaveFilter() {
    this.set('filterName', this.userFilter.slice(0));
    this.$.filterDialog.opened = true;
  },

  _dismissFilterDialog() {
    this.$.filterDialog.opened = false;
  },

  _saveFilter() {
    if (this.presetFilters.map(m => m.filter).indexOf(this.userFilter.trim()) === -1) {
      const newfilter = {
        name: this.filterName,
        filter: this.userFilter,
        default: false,
      };
      this.addFilter(newfilter);
      this.useFilter(newfilter);
      this.$.filterDialog.opened = false;
      this.set('filterName', '');
    }
  },

  _deletePresetFilter(e) {
    e.stopPropagation();
    this.deleteFilter(this.userSavedFilters.indexOf(e.model.item));
    if (this.selectedPresetFilter === e.model.item.filter) {
      this.useFilter('');
    }
    if (this.userFilter.indexOf(e.model.item.filter) > -1 && this.searchable) {
      this.set('userFilter', this.userFilter.replace(e.model.item.filter, ''));
    }
  },

  _userFilterChanged(userFilter) {
    let currentFilterKey;
    if (this.name) {
      currentFilterKey = `mist-filter#${this.id}/${this.name
        .toLowerCase()
        .replace(' ', '-')}/userFilter`;
    } else {
      currentFilterKey = `mist-filter#${this.id}/userFilter`;
    }
    if (this.userFilter !== undefined && this.isAttached) {
      const trimmed = userFilter.trim();
      if (this.editingFilter) {
        this._updateSelectedFilter(trimmed);
      }
      if (this.userFilter || localStorage.getItem(currentFilterKey)) {
        localStorage.setItem(currentFilterKey, this.userFilter);
      }
      this.dispatchEvent(new CustomEvent('filter-change', { bubbles: true, composed: true }));
    }
  },

  _updateSelectedFilter() {
    // const filter = this.combinedPresetFilters.find((f) => userFilter === f.filter);
    this.set('selectedPresetFilter', this.userFilter);
  },

  _computeShowSaveSearch() {
    return this.editingFilter && this.userFilter.length && !this._filterIsAPresetFilter();
  },

  _computeCombinedPresetFilters() {
    const pf = this.presetFilters || [];
    const usf = this.userSavedFilters || [];
    return pf.concat(usf);
  },

  _startEditingFilter() {
    if (this.searchable) {
      this.editingFilter = true;
      if (!this.$.searchInput.focused) {
        this.$.searchInput.focus();
      }
    }
  },

  _searchInputFocusedChanged(e) {
    if (
      e.target.focused ||
      this.shadowRoot.querySelector('paper-icon-button[icon="close"]').pressed
    )
      return;
    // eslint-disable-next-line func-names
    this.async(function() {
      if (this._filterIsAPresetFilter()) this.set('editingFilter', false);
    }, 100);
  },

  _filterIsAPresetFilter() {
    return (
      !this.userFilter ||
      !this.userFilter.trim() ||
      this.combinedPresetFilters.map(m => m.filter).indexOf(this.userFilter.trim()) > -1
    );
  },

  _keyDownSearchInput(e) {
    // ESC
    if (e.keyCode === 27) {
      // exit editing if there is a filter enabled
      if (this.selectedPresetFilter === this.userFilter) {
        this.set('editingFilter', false);
      }
      // inform consumer of ESC events
      this.dispatchEvent(new CustomEvent('escape-pressed', { composed: true, bubbles: true }));
    }
    // ENTER
    if (e.keyCode === 13 && this.$.searchInput.focused) {
      this._updateSelectedFilter(this.userFilter);
      // stop editing only if
      if (this.userFilter === this.selectedPresetFilter) {
        this.set('editingFilter', false);
      }
    }
  },

  _keyDownFilterName(e) {
    // ENTER
    if (e.keyCode === 13 && this.$.filterDialog.opened) {
      this._saveFilter();
    }
  },

  _clearFilter() {
    if (this.autoHide) {
      this.autoHide = false;
      this.async(() => {
        this.autoHide = true;
      }, 1000);
    }
    // console.log('_clearFilter');
    this.set('userFilter', '');
    this.set('editingFilter', false);
  },

  _clearFilterAndFocus(e) {
    e.stopPropagation();
    // console.log('_clearFilterAndFocus');
    this.set('userFilter', '');
    this.set('editingFilter', true);
    this.$.searchInput.shadowRoot.querySelector('input').focus();
  },

  _resetUserFilter() {
    // Reset the user defined filter every time the base filter gets updated
    if (this.userFilter && this.name) {
      // console.log('_resetUserFilter');
      this._fetchSavedFilter();
    }
    this.set('editingFilter', false);
  },

  _computeFilter(baseFilter, userFilter) {
    if (!baseFilter) return userFilter;
    if (!userFilter) return baseFilter;
    return `(${baseFilter}) AND (${userFilter})`;
  },

  _showFilterInput() {
    return this.alwaysShowInput ? this.alwaysShowInput : this.editingFilter;
  },

  _showButton() {
    return this.buttonName;
  },

  _computeSlot(buttonName, el) {
    if (this.buttonName.length && el === 'button') {
      return 'dropdown-trigger';
    }
    if (!this.buttonName.length && el === 'icon') {
      return 'dropdown-trigger';
    }
    return '';
  },

  _hideClearButton() {
    return !this.editingFilter || this.userFilter.length === 0;
  },
});
