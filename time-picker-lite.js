'use strict';
import {PolymerElement, html} from '@polymer/polymer/polymer-element.js';
import '@polymer/paper-input/paper-input.js';


/**
 * @customElement
 * @polymer
 */
class TimePickerLite extends PolymerElement {
  static get template() {
    // language=HTML
    return html`
      <style>


        .paper-input-input input {
          font-size: inherit;
          border: 0;
          text-align: center;
        }

        /***************** this is used to remove arrows from inputs *****************************/

        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
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
        <div slot="input" class="paper-input-input">
          <input value="{{hoursInput::input}}" readonly$="[[readonly]]" placeholder="hh" type="number" min="1" max="23">:
          <input value="{{minutesInput::input}}" readonly$="[[readonly]]" placeholder="mm" type="number" min="1"
                 max="59">
        </div>
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
        reflectToAttribute: true,
      },
      required: {
        type: Boolean,
        value: false,
        reflectToAttribute: true,
      },
      disabled: {
        type: Boolean,
        value: false,
        reflectToAttribute: true,
      },
      hoursInput: {
        type: Number
      },
      minutesInput: {
        type: Number
      },
      label: String,
      invalid: {
        type: Boolean,
        value: false
      },
      _stopTimeCompute: Boolean
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

    this._stopTimeCompute = true;
    const dData = newValue.split(':');
    this.set('hoursInput', dData[0]);
    this.set('minutesInput', dData[1]);
    this._stopTimeCompute = false;

    this.set('value', dData[0] + ':' + dData[1]);

  }

  _isValidHour() {
    return this.hoursInput >= 1 && this.hoursInput <= 23 && String(this.hoursInput).length <= 2;
  }

  _isValidMinute() {
    return this.minutesInput >= 1 && this.minutesInput <= 59 && String(this.minutesInput).length <= 2;
  }

  computeTime(hours, minutes) {
    if (this._stopTimeCompute) {
      // prevent a loop when setting value from backend
      return;
    }

    hours = this._formatHours(hours);
    minutes = this._formatMinutes(minutes);

    this.set('hoursInput', hours);
    this.set('minutesInput', minutes);
    this.set('value', hours + ':' + minutes);
  }

  _formatHours(hours) {
    if (isNaN(hours) || hours < 1 || hours > 23) {
      return null;
    }
    return hours;
  }

  _formatMinutes(minutes) {
    if (isNaN(minutes) || minutes < 1 || minutes > 59) {
      return null;
    }
    return minutes;
  }

  _isValidHours() {
    return isNaN(this.hoursInput) || this.hoursInput < 1 || this.hoursInput > 23;
  }

  _isValidMinutes() {
    return isNaN(this.minutesInput) || this.minutesInput < 1 || this.minutesInput > 59;
  }

  _clearData() {
    this.set('hoursInput', undefined);
    this.set('minutesInput', undefined);
    this.set('value', null);
    this.set('invalid', false);
  }

  validate() {
    this.set('invalid', this._isValidHours() || this._isValidMinutes());
    return this._isValidHours() || this._isValidMinutes();
  }

}


window.customElements.define('timepicker-lite', TimePickerLite);
