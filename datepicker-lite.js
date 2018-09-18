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

        paper-input-container {
          max-width: 225px;
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
        <iron-icon slot="prefix" on-keypress="keyCalendar" icon="date-range" alt="toggle" title="toggle" tabindex="1"
                   on-tap="toggleCalendar"></iron-icon>
        <div slot="input" class="paper-input-input">
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
      _clearDateInProgress: Boolean
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

    this.value = this._getDateString(date);
    this.set('monthInput', month);
    this.set('dayInput', day);
    this.set('yearInput', year);
  }

  computeDate(month, day, year) {
    this.set('value', year + '-' + month + '-' + day);
    if (this._isValidYear() && this._isValidMonth() &&
        this._isValidDay() && this._enteredDateIsValid() ) {
      let newDate = new Date(year, month - 1, day);
      this.set('inputDate', newDate);
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
    return this.yearInput >= 1970 && this.yearInput < 9999 && this.yearInput.length === 4;
  }

  _isValidMonth() {
    // this.monthInput = this.monthInput.length < 2 ? '0' + this.monthInput : this.monthInput;
    // console.log(this.monthInput);
    // console.log(this.monthInput >= 1);
    return this.monthInput >= 1 && this.monthInput <= 12;
  }

  _isValidDay() {
    // this.dayInput = this.dayInput.length < 2 ? '0' + this.dayInput : this.dayInput;
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
    // if ((typeof this.monthInput === 'undefined' ||
    //     typeof this.dayInput === 'undefined' ||
    //     typeof this.yearInput === 'undefined') && this.required) {
    //   console.log("case 1");
    //   valid = false;
    // } else if (!this._isValidYear() || !this._isValidMonth() || !this._isValidDay()) {
    //   console.log("case 2");
    //   valid = false;
    // } else {
    //   console.log("case 3");
    //   valid = this._enteredDateIsValid();
    // }

    if ((typeof this.monthInput === 'undefined' &&
        typeof this.dayInput === 'undefined' &&
        typeof this.yearInput === 'undefined') && this.required) {
      return this._enteredDateIsValid();
    } else {

    }

    this.set('invalid', !this.invalid);
    return valid;
  }

  _valueChanged(newValue) {
    if (!newValue) {
      if (this.monthInput || this.dayInput || this.yearInput) {
        this._clearData();
      }
      return;
    }
    if (this._enteredDateIsValid()) {
      this.set('inputDate', new Date(newValue));
    }

  }

  // _dayChanged(day) {
  //   if (typeof day !== 'undefined') {
  //     const d = Number(day);
  //     if (d <= 0) {
  //       this.set('dayInput', 1);
  //     }
  //     if (d > 31) {
  //       this.set('dayInput', 31);
  //     }
  //   }
  // }
  //
  // _monthChanged(month) {
  //   if (typeof month !== 'undefined') {
  //     const d = Number(month);
  //     if (d <= 0) {
  //       this.set('monthInput', 1);
  //     }
  //     if (d > 12) {
  //       this.set('monthInput', 12);
  //     }
  //   }
  // }
  //
  // _yearChanged(year) {
  //   if (year && String(year).length >= 4) {
  //     const d = Number(year);
  //     if (d <= 1970) {
  //       this.set('yearInput', 1970);
  //     }
  //     if (d > 9999) {
  //       this.set('yearInput', 9999);
  //     }
  //   }
  // }

}

window.customElements.define('datepicker-lite', DatePickerLite);
