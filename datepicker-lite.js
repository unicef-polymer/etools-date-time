'use strict';
import {PolymerElement, html} from '@polymer/polymer/polymer-element.js';
import {GestureEventListeners} from '@polymer/polymer/lib/mixins/gesture-event-listeners.js';
import '@polymer/paper-input/paper-input.js';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/paper-button/paper-button.js';

import './calendar-lite.js';

var openedDatepickerLiteElems = window.openedDatepickerLiteElems || [];
var openedDatepickerLiteElemsCloseTimeout = window.openedDatepickerLiteElemsCloseTimeout || null;

const _closeDatepickers = (keepOpenDatepicker) => {
  openedDatepickerLiteElems.forEach((datePicker) => {
    if (datePicker.calendar.opened && keepOpenDatepicker !== datePicker.calendar) {
      datePicker.calendar.set('opened', false);
    }
  });

  openedDatepickerLiteElems = (keepOpenDatepicker && keepOpenDatepicker.opened)
      ? [{keepOpen: false, calendar: keepOpenDatepicker}]
      : [];
};

const _getClickedDatepicker = (e) => {
  let clickedDatepicker = (e.target.tagName.toLowerCase() === 'datepicker-lite')
      ? e.target
      : e.target.closest('datepicker-lite');
  if (!clickedDatepicker) {
    const openedDatepikerMap = openedDatepickerLiteElems.find(d => d.keepOpen === true);
    if (openedDatepikerMap && openedDatepikerMap.keepOpen) {
      clickedDatepicker = openedDatepikerMap.calendar;
    }
  }
  return clickedDatepicker;
};

const _handleDatepickerLiteCloseOnClickOrTap = (e) => {
  if (openedDatepickerLiteElems.length === 0 || openedDatepickerLiteElemsCloseTimeout !== null) {
    return;
  }
  // timeout is used for debouncing Event and MouseEvent
  openedDatepickerLiteElemsCloseTimeout = setTimeout(() => {
    const clickedDatepicker = _getClickedDatepicker(e);
    openedDatepickerLiteElemsCloseTimeout = null;
    if (!(openedDatepickerLiteElems.length === 1 && openedDatepickerLiteElems[0] === clickedDatepicker)) {
      _closeDatepickers(clickedDatepicker);
    }
  }, 10);
};

document.addEventListener('tap', _handleDatepickerLiteCloseOnClickOrTap);
document.addEventListener('click', _handleDatepickerLiteCloseOnClickOrTap);

/**
 * @customElement
 * @polymer
 * @appliesMixin GestureEventListeners
 */
class DatePickerLite extends GestureEventListeners(PolymerElement) {
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
        }

        iron-icon {
          @apply --layout;
          cursor: pointer;
        }

        iron-icon[slot="prefix"] {
          margin-right: 8px;
        }

        iron-icon[slot="suffix"] {
          margin-left: 8px;
          width: 14px;
          height: 14px;
        }

        .clear-btn,
        .close-btn {
          margin: 10px;
        }

        .clear-btn {
          background: var(--datepiker-lite-clear-btn-bg, #ff4747);
          color: #fff;
          padding: 6px;

        }

        .close-btn {
          padding: 6px;
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

        #calendar {
          margin-top: -10px;
        }

        .actions {
          display: flex;
          justify-content: flex-end;
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
                             invalid="{{invalid}}">
        <label hidden$=[[!label]] slot="label">[[label]]</label>

        <iron-icon on-keypress="_toggelOnKeyPress" icon="date-range" title="Toggle calendar" tabindex="1"
                   on-tap="toggleCalendar" slot="prefix"></iron-icon>

        <div slot="input" class="paper-input-input">
          <input value="{{monthInput::input}}" readonly$="[[readonly]]" class="monthInput" placeholder="mm"
                 type="number" min="1" max="12" on-blur="_handleOnBlur">/
          <input value="{{dayInput::input}}" readonly$="[[readonly]]" class="dayInput" placeholder="dd" type="number"
                 min="1" max="31" on-blur="_handleOnBlur">/
          <input value="{{yearInput::input}}" readonly$="[[readonly]]" class="yearInput" placeholder="yyyy"
                 type="number" min="1" max="9999" on-blur="_handleOnBlur">
        </div>

        <iron-icon icon="clear" slot="suffix" on-tap="_clearData" title="Clear" tabindex="1"
                   hidden$="[[clearBtnInsideDr]]"></iron-icon>

        <template is="dom-if" if="[[errorMessage]]">
          <paper-input-error aria-live="assertive" slot="add-on">[[errorMessage]]</paper-input-error>
        </template>
      </paper-input-container>

      <calendar-lite id="calendar" on-date-change="datePicked" date="[[inputDate]]" min-date="[[minDate]]"
                     max-date="[[maxDate]]" hidden$="[[!opened]]">
        <div class="actions" slot="actions">
          <paper-button raised class="clear-btn" on-tap="_clearData" hidden$="[[!clearBtnInsideDr]]">Clear
          </paper-button>
          <paper-button raised class="close-btn" on-tap="toggleCalendar">Close</paper-button>
        </div>
      </calendar-lite>

    `;
  }

  // language=JS
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
      errorMessage: {
        type: String,
        value: 'Invalid date'
      },
      disabled: {
        type: Boolean,
        value: false,
        reflectToAttribute: true
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
      clearBtnInsideDr: {
        type: Boolean,
        value: false
      },
      _clearDateInProgress: Boolean,
      _stopDateCompute: Boolean,
      autoValidate: {
        type: Boolean,
        value: false
      },
      minDate: Date,
      maxDate: Date
    };
  }

  static get observers() {
    return [
      'computeDate(monthInput, dayInput, yearInput)'
    ];
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('tap', () => {
      if (openedDatepickerLiteElems.length === 0) {
        return;
      }
      for (let i = 0; i < openedDatepickerLiteElems.length; i++) {
        if (openedDatepickerLiteElems[i].calendar === this && this.opened) {
          openedDatepickerLiteElems[i].keepOpen = true;
          break;
        }
      }
    });
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
    if (this.autoValidate) {
      // this.set('_stopDateCompute', false);
      this.set('invalid', !this._isValidYear() || !this._isValidMonth() || !this._isValidDay());
    }

    if (month !== undefined && day !== undefined && year !== undefined) {
      if (this._stopDateCompute) {
        // prevent setting wrong value when year/month/day are set by datepiker in datePicked
        return;
      }

      if (this._isValidYear() && this._isValidMonth() &&
          this._isValidDay() && this._enteredDateIsValid()) {
        let newDate = new Date(year, month - 1, day);
        this.set('inputDate', newDate);
        this.set('value', year + '-' + month + '-' + day);
      }
    }
  }

  toggleCalendar() {
    if (!this.readonly) {
      this.set('opened', !this.opened);

      if (openedDatepickerLiteElems.length > 0) {
        _closeDatepickers();
      }

      if (this.opened) {
        openedDatepickerLiteElems.push({keepOpen: true, calendar: this});
      }
    }
  }

  _toggelOnKeyPress(event) {
    if (!this.readonly) {
      if (event.which === 13 || event.button === 0) {
        this.toggleCalendar();
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
    if (this.autoValidate) {
      this.validate();
    } else {
      this.set('invalid', false);
    }
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

    if (this.required) {
      valid = this._isValidMonth() && this._isValidDay() && this._isValidYear() && this._enteredDateIsValid();
    } else {
      valid = this._enteredDateIsValid();
    }
    this.set('invalid', !valid);
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

    const d = new Date(dData[0], Number(dData[1]) - 1, dData[2]);
    if (d.toString() !== 'Invalid Date') {
      this.set('inputDate', d);
    }
  }

  _handleOnBlur() {
    if (this.autoValidate) {
      this.validate();
    }
  }

}

window.customElements.define('datepicker-lite', DatePickerLite);