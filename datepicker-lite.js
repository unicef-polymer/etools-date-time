'use strict';
import {PolymerElement, html} from '@polymer/polymer/polymer-element.js';
import '@polymer/paper-dropdown-menu/paper-dropdown-menu.js';
import '@polymer/paper-input/paper-input.js';
import '@polymer/iron-icons/iron-icons.js';

import './calendar-lite.js';

/**
 * @customElement
 * @polymer
 */
class DatePickerLite extends PolymerElement {
  static get template() {
    // language=HTML
    return html`
      <style>

        :host {
          display: block;
        }

        paper-dropdown-menu {
          width: 100%;
        }

        .paper-input-input input {
          font-size: inherit;
          border: 0;
          text-align: center;
        }

        iron-icon {
          margin-right: 8px;
          cursor: pointer;
          @apply --datepicker-lite-icon
        }

        .clear-btn {
          background: var(--my-elem-primary);
          color: #fff;
          padding: 6px;
          margin: 10px 0 10px 10px;
        }

        .close-btn {
          padding: 6px;
          margin: 10px 0 10px 10px;
        }

        .monthInput {
          width: 35px;
        }

        .dayInput {
          width: 25px;
        }

        .yearInput {
          width: 40px;
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
                             error-message="Invalid date.">
        <label hidden$=[[!label]] slot="label">[[label]]</label>
        <div slot="input" class="paper-input-input">
          <span>
            <iron-icon on-keypress="keyCalendar" icon="date-range" alt="toggle" title="toggle" tabindex="1"
                    on-tap="toggleCalendar"></iron-icon>
          </span>
          <input value="{{monthInput::input}}" readonly$="[[readonly]]" class="monthInput" placeholder="mm" type="number" min="1" max="12">/
          <input value="{{dayInput::input}}" readonly$="[[readonly]]" class="dayInput" placeholder="dd" type="number" min="1" max="31">/
          <input value="{{yearInput::input}}" readonly$="[[readonly]]" class="yearInput" placeholder="yyyy" type="number" min="1" max="9999">
        </div>
      </paper-input-container>

      <calendar-lite id="calendar" on-date-change="datePicked" date="[[inputDate]]" hidden$="[[!opened]]">
        <div slot="actions">
          <paper-button raised class="clear-btn" on-tap="_clearData">Clear</paper-button>
          <paper-button raised class="close-btn" on-tap="toggleCalendar">Close</paper-button>
        </div>
      </calendar-lite>

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
      label: String,
      monthInput: {
        type: Number
      },
      dayInput: {
        type: Number
      },
      yearInput: {
        type: Number
      },
      invalid: {
        type: Boolean,
        value: false
      },
      inputDate: {
        type: Date,
        notify: true
      },
      opened: {
        type: Boolean,
        value: false
      },
      _clearDateInProgress: Boolean,
      _stopDateCompute: Boolean
    };
  }

  static get observers() {
    return [
      'computeDate(monthInput, dayInput, yearInput)'
    ];
  }

  _getDateString(date) {
    let month = '' + (date.getMonth() + 1);
    let day = '' + date.getDate();
    let year = date.getFullYear();

    month = month.length < 2 ? '0' + month : month;
    day = day.length < 2 ? '0' + day : day;

    return [year, month, day].join('-');
  }

  datePicked(event) {
    if (this._clearDateInProgress) {
      this._clearDateInProgress = false;
      return;
    }
    let date = event.detail.date;
    let month = '' + (date.getMonth() + 1);
    let day = '' + date.getDate();
    let year = date.getFullYear();

    month = month.length < 2 ? '0' + month : month;
    day = day.length < 2 ? '0' + day : day;

    this._stopDateCompute = true;
    this.set('monthInput', month);
    this.set('dayInput', day);
    this.set('yearInput', year);
    this.value = this._getDateString(date);
    this._stopDateCompute = false;
  }

  computeDate(month, day, year) {
    if (this._stopDateCompute) {
      // prevent setting wrong value when year/month/day are set by datepiker in datePicked
      return;
    }

    if (this._isValidYear() && this._isValidMonth() &&
        this._isValidDay() && this._enteredDateIsValid() ) {
      let newDate = new Date(year, month - 1, day);
      this.set('inputDate', newDate);
      this.set('value', year + '-' + month + '-' + day);
    }
  }

  toggleCalendar() {
    if (!this.readonly) {
      this.set('opened', !this.opened);
    }

  }

  keyCalendar(event){
    if (!this.readonly) {
      if (event.which === 13 || event.button === 0){
        this.set('opened', !this.opened);
      }
    }
  }

  _clearData() {
    this._clearDateInProgress = true;
    this.set('inputDate', new Date());
    this.set('monthInput', undefined);
    this.set('dayInput', undefined);
    this.set('yearInput', undefined);
    this.set('value', null);
    this.set('invalid', false);
  }

  _isValidYear() {
    if (this.yearInput !== undefined) {
      return this.yearInput >= 1970 && this.yearInput < 9999 && String(this.yearInput).length === 4;
    }
    return false;
  }

  _isValidMonth() {
    return this.monthInput >= 1 && this.monthInput <= 12;
  }

  _isValidDay() {
    return this.dayInput >= 1 && this.dayInput <= 31;
  }


  _enteredDateIsValid() {
    let newDate = new Date(this.yearInput, this.monthInput - 1, this.dayInput);

    let newYear = newDate.getFullYear();
    let newMonth = newDate.getMonth() + 1;
    let newDay = newDate.getDate();

    return newMonth === Number(this.monthInput) &&
        newDay === Number(this.dayInput) &&
        newYear === Number(this.yearInput);
  }


  validate() {
    let valid = true;

    if ((this._isValidMonth() && this._isValidDay() && this._isValidYear()) && this.required) {
      valid = this._enteredDateIsValid();
      this.set('invalid', !this._enteredDateIsValid());
      return valid;

    } else if (!this.required) {
      if (this.monthInput !== undefined || this.dayInput !== undefined || this.yearInput !== undefined) {
        if (this._isValidMonth() && this._isValidDay() && this._isValidYear()) {
          valid = this._enteredDateIsValid();
          this.set('invalid', false);
          return valid;

        }else {
          this.set('invalid', true);
          valid = this._enteredDateIsValid();
          return valid;
        }
      }

      valid = this._enteredDateIsValid();
      this.set('invalid', false);
      return valid;
    }

    this.set('invalid', true);
    return valid;
  }

  _valueChanged(newValue) {
    if (!newValue) {
      if (this.monthInput || this.dayInput || this.yearInput) {
        this._clearData();
      }
      return;
    }
    this._stopDateCompute = true;
    const dData = newValue.split('-');
    this.set('monthInput', dData[1]);
    this.set('dayInput', dData[2]);
    this.set('yearInput', dData[0]);
    this._stopDateCompute = false;

    const d = new Date(newValue);
    if (d.toString() !== 'Invalid Date') {
      this.set('inputDate', d);
    }
  }

}

window.customElements.define('datepicker-lite', DatePickerLite);
