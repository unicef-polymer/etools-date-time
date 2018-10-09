'use strict';
import {PolymerElement, html} from '@polymer/polymer/polymer-element.js';
import '@polymer/iron-flex-layout/iron-flex-layout.js';
import '@polymer/paper-input/paper-input.js';
import '@polymer/paper-input/paper-input-error.js';
import '@polymer/iron-icons/device-icons.js';

/**
 * @customElement
 * @polymer
 */
class TimeInput extends PolymerElement {
  static get template() {
    // language=HTML
    return html`
      <style>
        :host {
          display: block;
        }
        
        .paper-input-input input {
          font-size: inherit;
          border: 0;
          text-align: center;
          width: var(--etools-time-inputs-width, 34px);
        }

        /***************** this is used to remove arrows from inputs *****************************/

        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }

        iron-icon {
          @apply --layout;
          margin-right: 8px;
          @apply --etools-time-icon
        }

        *[hidden] {
          display: none;
        }
      </style>

      <paper-input-container always-float-label
                             disabled$="[[disabled]]"
                             required$="[[required]]"
                             invalid="{{invalid}}"
                             value="[[value]]">
        <label hidden$=[[!label]] slot="label">[[label]]</label>
        <iron-icon icon="device:access-time" slot="prefix" hidden$="[[hideIcon]]"></iron-icon>
        <div slot="input" class="paper-input-input">
          <input value="{{hoursInput::input}}" on-blur="_formatHour" readonly$="[[readonly]]" placeholder="hh"
                 type="number" min="1" max="23">:
          <input value="{{minutesInput::input}}" on-blur="_formatMinutes" readonly$="[[readonly]]" placeholder="mm"
                 type="number" min="1"
                 max="59">
        </div>
        <template is="dom-if" if="[[errorMessage]]">
          <paper-input-error aria-live="assertive" slot="add-on">[[errorMessage]]</paper-input-error>
        </template>
      </paper-input-container>


    `;
  }

  static get properties() {
    return {
      value: {
        type: String,
        notify: true,
        observer: '_valueChanged'
      },
      readonly: {
        type: Boolean,
        value: false,
        reflectToAttribute: true
      },
      required: {
        type: Boolean,
        value: false,
        reflectToAttribute: true
      },
      disabled: {
        type: Boolean,
        value: false,
        reflectToAttribute: true
      },
      autoValidate: {
        type: Boolean,
        value: false
      },
      hoursInput: {
        type: Number
      },
      minutesInput: {
        type: Number
      },
      label: {
        type: String,
        value: 'Time'
      },
      invalid: {
        type: Boolean,
        value: false
      },
      hideIcon: {
        type: Boolean,
        value: false
      },
      errorMessage: {
        type: String,
        value: 'Invalid time'
      }
    };
  }

  static get observers() {
    return [
      'computeTime(hoursInput, minutesInput)'
    ];
  }

  _valueChanged(newValue) {
    if (!newValue) {
      if (this.hoursInput || this.minutesInput) {
        this._clearData();
      }
      return;
    }

    const dData = newValue.split(':');
    this.set('hoursInput', dData[0]);
    this.set('minutesInput', dData[1]);

  }

  computeTime(hours, minutes) {
    if (hours !== undefined && minutes !== undefined) {
      if (this.autoValidate && this._isValidHours() && this._isValidMinutes()) {
        this.set('invalid', false);
      }
      this.set('hoursInput', hours);
      this.set('minutesInput', minutes);
      this.set('value', hours + ':' + minutes + ':00');
    }
  }

  _formatHour() {
    if (isNaN(Number(this.hoursInput)) || Number(this.hoursInput) < 1 || Number(this.hoursInput) > 23) {
      if (this.autoValidate) {
        this.set('invalid', true);
      }
    } else {
      this.hoursInput = this.hoursInput.length < 2 ? '0' + this.hoursInput : this.hoursInput;
    }
  }

  _formatMinutes() {
    if (isNaN(Number(this.minutesInput)) || Number(this.minutesInput) < 1 || Number(this.minutesInput) > 59) {
      if (this.autoValidate) {
        this.set('invalid', true);
      }
    } else {
      this.minutesInput = this.minutesInput.length < 2 ? '0' + this.minutesInput : this.minutesInput;
    }
  }

  _isValidHours() {
    return Number(this.hoursInput) >= 0 && Number(this.hoursInput) < 24;
  }

  _isValidMinutes() {
    return Number(this.minutesInput) >= 0 && Number(this.minutesInput) < 60;
  }

  _clearData() {
    this.set('hoursInput', undefined);
    this.set('minutesInput', undefined);
    this.set('value', null);
    this.set('invalid', false);
  }

  validate() {
    const valid = this._isValidHours() && this._isValidMinutes();
    this.set('invalid', !valid);
    return valid;
  }

}

window.customElements.define('time-input', TimeInput);
