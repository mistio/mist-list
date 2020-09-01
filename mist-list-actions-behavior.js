import { IronA11yKeysBehavior } from '@polymer/iron-a11y-keys-behavior/iron-a11y-keys-behavior.js';
  /**
   * @polymerBehavior MistListActionsBehavior
   */
  export const MistListActionsBehavior = [IronA11yKeysBehavior, {

    properties: {
      items: {
        type: Array,
        value: function () {
          return []
        }
      },
      actions: {
        type: Array,
        value: function () {
          return []
        },
        notify: true
      },
      boundKeys: {
        type: Array,
        value: function () {
          return Object.keys(this.keyBindings).join(' ').split(' ');
        }
      },
      //preventDefault: {type: Boolean, value: true, notify: true},
      keyEventTarget: {
        type: Object,
        value: function () {
          return document.body;
        }
      }
    },

    keyBindings: {
      'enter': '_enterPressed',
    },

    observers: [
      '_updateActions(items.*)'
    ],

    _updateActions: function (items) {
      // recompute the actions array property as the intersection
      // of the available actions of the selected items
      this.debounce('_updateActions', function () {
        var actions = [];
        if (this.items && this.items.length > 0) {
          actions = this.computeItemActions(this.items[0]);
          if (actions.length) {
            // Calculate the intersection of each item's actions
            for (var i = 1; i < this.items.length; i++) {
              var itemActions = this.computeItemActions(this.items[i]);
              for (a in actions) {
                if (itemActions.indexOf(actions[a]) == -1) {
                  actions.splice(a, 1);
                }
              }
            }
            actions = this.computeActionListDetails(actions);
            if (this.items.length > 1) {
              // Filter out actions that are only available for single items
              actions = actions.filter(function (a) {
                return a ? a.multi : false;
              });
            }
          }
        }
        this.set('actions', actions);
      }, 100);
    },

    _handleError: function (e) {
      console.log(e.detail.request.xhr.statusText);
      this.fire('toast', {
        msg: 'Error: ' + e.detail.request.xhr.status + " " + e.detail.request.xhr.statusText,
        duration: 5000
      });
    },

    _enterPressed: function (event) {
      console.log(event.detail);
      dialogs = this.shadowRoot.querySelectorAll('vaadin-dialog') || [];
      for (var i = 0; i < dialogs.length; i++) {
        if (dialogs[i].opened && !this.modal) {
          var overlay = dialogs[i].$.overlay.$.overlay,
            overlayShadowRoot = overlay.querySelector('#content').shadowRoot,
            confirmButton = overlayShadowRoot.querySelector('paper-button[dialog-confirm]');
          if (confirmButton) {
            event.preventDefault();
            confirmButton.click();
          }
        }
      }
    },

    _dismissDialog: function (event) {
      var dialogs = this.shadowRoot.querySelectorAll('vaadin-dialog') || [];
      for (var i = 0; i < dialogs.length; i++) {
        if (dialogs[i].opened) {
          dialogs[i].opened = false;
          return;
        }
      }
    }
  }];
