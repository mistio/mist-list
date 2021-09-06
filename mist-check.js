import '@polymer/polymer/polymer-legacy.js';
import '@polymer/iron-icon/iron-icon.js';
import { Polymer } from '@polymer/polymer/lib/legacy/polymer-fn.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
Polymer({
  _template: html`
        <style>
            :host {
                display: inline-block;
                min-width: 36px;
                color: inherit;
            }

            :host([selected]) .check {
                transform: rotate3d(0, 1, 0, 180deg);
            }
            :host([selected]) iron-icon {
                display: none;
            }
            :host([selected]) iron-icon#check {
                display: flex;
                transform: rotate3d(0, 1, 0, -180deg) scale(1);
                opacity: 1;
            }

            :host([selected]) .unchecked {
                opacity: 0;
            }

            .check {
                border-radius: 50%;
                width: 32px;
                height: 32px;
                transition: transform 350ms ease-in-out;
                background-color: rgba(158, 158, 158, 0.13);
                color: inherit;
                will-change: transform;
                cursor: pointer;
                box-sizing: border-box;
                text-align: center;
                font-size: 13px;
                line-height: 30px;
            }

            .unchecked {
                border-radius: inherit;
                width: 100%;
                height: 100%;
                transition: opacity 200ms ease-in-out 100ms;
                will-change: opacity;
                text-transform: uppercase;
            }

            iron-icon#check {
                transition: transform 300ms ease-in-out 100ms;
                will-change: opacity;
                transform: rotate3d(0, 1, 0, -180deg) scale(0);
                position: absolute;
                top: 0;
                left: 0;
                padding: 4px;
                opacity: 0;
                color: inherit;
            }

            .check img {
                width: 24px;
                height: 24px;
            }

            :host[disabled] {
                display: inline-block;
                opacity: 0;
            }

            .layout.horizontal {
                display: flex;
                flex-direction: row;
            }

            .center-center {
                align-items: center;
                justify-content: center;
            }
        </style>
        <div class="check">
            <span class="unchecked layout horizontal center-center">
                <slot></slot>
                <template is="dom-if" if="[[_hasSlash(icon)]]" restamp>
                    <img src="[[icon]]">
                </template>
                <template is="dom-if" if="[[!_hasSlash(icon)]]" restamp>
                    <iron-icon icon="[[icon]]"></iron-icon>
                </template>

            </span>
            <iron-icon icon="check" id="check"></iron-icon>
        </div>
`,

  is: 'mist-check',

  properties: {
      item: {
          type: Object
      },
      selected: {
          type: Boolean,
          reflectToAttribute: true,
          value: false,
          notify: true
      }
  },

  listeners: {
      'click': 'toggle',
  },

  toggle: function (e) {
      e.stopImmediatePropagation();
      this.set('selected', !this.selected);
  },

  _hasSlash(icon) {
      return icon.indexOf('/') != -1;
  }
});
