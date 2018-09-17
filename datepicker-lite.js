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
                             required$="[[required]]" invalid="{{invalid}}" error-message="Invalid date.">
        <label hidden$=[[!label]] slot="label">[[label]]</label>
        <iron-icon slot="prefix" on-keypress="keyCalendar" icon="date-range" alt="toggle" title="toggle" tabindex="1"
                   on-tap="toggleCalendar"></iron-icon>
        <div slot="input" class="paper-input-input">
          <input value="{{monthInput::input}}" class="monthInput" placeholder="mm" type="number" min="1" max="12">/
          <input value="{{dayInput::input}}" class="dayInput" placeholder="dd" type="number" min="1" max="31">/
          <input value="{{yearInput::input}}" class="yearInput" placeholder="yyyy" type="number" maxlength="4" min="1" max="9999">
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
        value: false
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
    if ( this.validate() ) {
      let newDate = new Date(year, month - 1, day);
      this.set('inputDate', newDate);
    }
  }

  toggleCalendar() {
    this.set('opened', !this.opened);
  }

  keyCalendar(event){
    if (event.which === 13 || event.button === 0){
      this.set('opened', !this.opened);
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

  validate() {
    this.set('invalid', false);

    if (this.yearInput < 1 || this.yearInput > 9999 ) {
      this.set('invalid', true);
      return;
    }

    if (this.monthInput < 1 || this.monthInput > 12 ) {
      this.set('invalid', true);
      return;
    }

    if (this.dayInput < 1 || this.dayInput > 31) {
      this.set('invalid', true);
      return;
    }

    if (typeof this.monthInput === 'undefined') {
      this.set('invalid', true);
      return;
    }

    if (typeof this.dayInput === 'undefined'){
      this.set('invalid', true);
      return;
    }

    if (typeof this.yearInput === 'undefined' || this.yearInput.length < 4) {
      this.set('invalid', true);
      return;
    }

    let newDate = new Date(this.yearInput, this.monthInput - 1, this.dayInput);

    let newYear = newDate.getFullYear();
    let newMonth = newDate.getMonth() + 1;
    let newDay = newDate.getDate();

    if (newMonth !== Number(this.monthInput) || newDay !== Number(this.dayInput) || newYear !== Number(this.yearInput)) {
      this.set('invalid', true);
      return;
    }

    return !this.invalid;
  }

  _valueChanged(newValue) {
    console.log(newValue);
    if (!newValue) {
      return;
    }

    let newDate = new Date(newValue);

    let newYear = newDate.getFullYear();
    let newMonth = newDate.getMonth() + 1;
    let newDay = newDate.getDate();

    if (newMonth !== Number(this.monthInput) || newDay !== Number(this.dayInput) || newYear !== Number(this.yearInput)) {
      this.set('inputDate', newDate);
    }

  }

}

window.customElements.define('datepicker-lite', DatePickerLite);
