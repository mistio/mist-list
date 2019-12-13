import '@polymer/polymer/polymer-legacy.js';
import '@polymer/paper-button/paper-button.js';
import { IronResizableBehavior } from '@polymer/iron-resizable-behavior/iron-resizable-behavior.js';
import { Polymer } from '@polymer/polymer/lib/legacy/polymer-fn.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
Polymer({
  _template: html`
        <style include="shared-styles">
            :host {
                display: flex;
                color: inherit;
                align-items: center;
                justify-content: flex-end;
                flex-wrap: nowrap;
                fill: inherit;
                width: 100%;
            }

            paper-button.actions {
                display: inline-block;
                flex-wrap: nowrap;
                white-space: nowrap;
                width: auto;
                min-width: auto;
                padding: 0.8em 1.57em 0.7em .57em;
                fill: inherit;
            }

            paper-button.more.actions {
                display: block;
                width: 100%;
                margin-left: 0 !important;
            }

            paper-button.actions iron-icon {
                fill: inherit;
            }

            paper-button.more.actions iron-icon {
                fill: rgba(0, 0, 0, 0.54);
            }

            paper-menu-button {
                padding: 0;
            }

            iron-icon {
                color: inherit;
                margin-top: -2px;
                min-width: 24px;
                padding-right: 8px;
            }

            paper-dialog-scrollable ul {
                padding-left: 18px;
                color: rgba(0, 0, 0, 0.54);
                font-size: 16px;
            }

            div.dropdown-content {
                color: rgba(0, 0, 0, 0.87);
            }

            div.dropdown-content paper-button {
                text-align: left;
                white-space: nowrap;
                padding: 16px 16px;
                margin-left: 16px;
            }

            paper-button.dropdown-trigger {
                min-width: auto !important;
                padding: .8em;
            }

            @media screen and (max-width: 600px) {

                paper-button#actionmenu ::content iron-icon,
                paper-button#actionmenu ::slotted(iron-icon) {
                    margin: 0 !important;
                }

                paper-button.dropdown-trigger {
                    padding: 8px !important;
                }
            }
        </style>
        <template is="dom-if" if="[[_hasActions(topActions.length)]]" restamp="">
            <template is="dom-repeat" items="[[topActions]]" as="action">
                <paper-button on-tap="_selectAction" class="visible actions">
                    <iron-icon icon="[[action.icon]]"></iron-icon> <span>[[action.name]]</span>
                </paper-button>
            </template>
        </template>
        <template is="dom-if" if="[[_hasActions(moreActions.length)]]" restamp="">
            <paper-menu-button id="actionmenu" horizontal-align="right" vertical-offset="40">
                <paper-button class="dropdown-trigger" slot="dropdown-trigger">
                    <iron-icon icon="more-vert"></iron-icon>
                </paper-button>
                <div class="dropdown-content" slot="dropdown-content">
                    <template is="dom-repeat" items="[[moreActions]]" as="action">
                        <paper-button on-tap="_selectAction" class="more actions">
                            <iron-icon icon="[[action.icon]]"></iron-icon> <span>[[action.name]]</span>
                        </paper-button>
                    </template>
                </div>
            </paper-menu-button>
        </template>
`,

  is: 'mist-list-actions',

  behaviors: [
      IronResizableBehavior
  ],

  properties: {
      actions: {
          type: Array
      },
      selectedAction: {
          type: Object
      },
      visibleActions: {
          type: Number,
          value: 3
      },
      topActions: {
          type: Array,
          computed: "_computeTopActions(actions, visibleActions)",
          value: function () {
              return []
          }
      },
      moreActions: {
          type: Array,
          computed: "_computeMoreActions(actions, visibleActions)",
          value: function () {
              return []
          }
      },
      useHalfWidth: {
          type: Boolean,
          reflectToAttribute: true
      }
  },

  observers: [
      '_actionsChanged(actions)'
  ],

  listeners: {
      'iron-resize': '_updateVisibleActions'
  },

  attached: function () {
      this._updateVisibleActions();
  },

  _selectAction: function (e) {
      if (this.shadowRoot.querySelector('paper-menu-button#actionmenu')) {
          this.shadowRoot.querySelector('paper-menu-button#actionmenu').close();
      }
      if (e.model.action) {
          this.set('selectedAction', e.model.action);
          this.fire('select-action', {
              action: e.model.action
          })
      }
  },

  _actionsChanged: function (actions) {
      if (actions) {
          this._updateVisibleActions();
      }
  },

  _computeTopActions: function (actions, visibleActions) {
      if (this.actions)
          return this.actions.slice(0, this.visibleActions);
  },

  _computeMoreActions: function (actions, visbleActions) {
      if (this.actions)
          return this.actions.slice(this.visibleActions);
  },

  _updateVisibleActions: function (e) {
      var offsetWidth = this.offsetWidth;
      this.set('visibleActions', Math.floor(offsetWidth - 50) / 150);
  },

  _hasActions: function (length) {
      return length > 0
  }
});
