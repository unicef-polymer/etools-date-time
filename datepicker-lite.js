'use strict';
import {PolymerElement, html} from '@polymer/polymer/polymer-element.js';
import {GestureEventListeners} from '@polymer/polymer/lib/mixins/gesture-event-listeners.js';
import '@polymer/paper-input/paper-input.js';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/paper-button/paper-button.js';
import '@a11y/focus-trap';

import './calendar-lite.js';

const dateLib = window.dayjs || window.moment;
if (!dateLib) {
  throw new Error('DatepickerLite: dayjs or moment is not loaded');
}

var openedDatepickerLiteElems = window.openedDatepickerLiteElems || [];
var openedDatepickerLiteElemsCloseTimeout = window.openedDatepickerLiteElemsCloseTimeout || null;
const controlFormat = 'YYYY-MM-DD';

const _closeDatepickers = (keepOpenDatepicker) => {
  openedDatepickerLiteElems.forEach((datePicker) => {
    if (datePicker.calendar.opened && keepOpenDatepicker !== datePicker.calendar) {
      datePicker.calendar.set('opened', false);
    }
  });

  openedDatepickerLiteElems =
    keepOpenDatepicker && keepOpenDatepicker.opened ? [{keepOpen: false, calendar: keepOpenDatepicker}] : [];
};

const _getClickedDatepicker = (e) => {
  let clickedDatepicker =
    e.target.tagName.toLowerCase() === 'datepicker-lite' ? e.target : e.target.closest('datepicker-lite');
  if (!clickedDatepicker) {
    const openedDatepikerMap = openedDatepickerLiteElems.find((d) => d.keepOpen === true);
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
          --paper-input-container: {
            width: 180px;
            max-width: 100%;
          }
          max-width: 100%;
        }
        paper-input-container {
          max-width: 100%;
        }

        .paper-input-input input {
          font-size: inherit;
          border: 0;
          text-align: center;
        }

        iron-icon {
          @apply --layout;
        }
        iron-icon:not[readonly] {
          cursor: pointer;
        }

        iron-icon[slot='prefix'] {
          margin-right: 8px;
        }

        iron-icon[slot='suffix'] {
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

        input[type='number']::-webkit-inner-spin-button,
        input[type='number']::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }

        *[hidden] {
          display: none;
        }
        input[type='number'] {
          background-color: transparent;
          -moz-appearance: textfield;
        }

        calendar-lite {
          z-index: 130;
        }
        #dateDisplayinputContainer:not([readonly]) {
          cursor: pointer;
        }
      </style>

      <paper-input-container
        id="dateDisplayinputContainer"
        always-float-label
        disabled$="[[disabled]]"
        readonly$="[[readonly]]"
        required$="[[required]]"
        invalid="{{invalid}}"
        on-keypress="_toggelOnKeyPressFromPaperInput"
        on-tap="toggleCalendarFromPaperInput"
      >
        <label hidden$="[[!label]]" slot="label">[[label]]</label>

        <iron-icon
          on-keypress="_toggelOnKeyPressFromIcon"
          readonly$="[[readonly]]"
          icon="date-range"
          title="Toggle calendar"
          tabindex$="[[_getTabindexByReadonly(readonly)]]"
          on-tap="toggleCalendarFromIcon"
          slot="prefix"
        ></iron-icon>

        <div slot="input" class="paper-input-input" readonly$="[[readonly]]">
          <template is="dom-if" if="[[_selectedDateDisplayFormatIsDefault(selectedDateDisplayFormat)]]">
            <input
              value="{{dayInput::input}}"
              readonly$="[[readonly]]"
              class="dayInput"
              placeholder="dd"
              type="number"
              min="1"
              max="31"
              on-blur="_handleOnBlur"
            />/
            <input
              value="{{monthInput::input}}"
              readonly$="[[readonly]]"
              class="monthInput"
              placeholder="mm"
              type="number"
              min="1"
              max="12"
              on-blur="_handleOnBlur"
            />/
            <input
              value="{{yearInput::input}}"
              readonly$="[[readonly]]"
              class="yearInput"
              placeholder="yyyy"
              type="number"
              min="1"
              max="9999"
              on-blur="_handleOnBlur"
            />
          </template>
          <template is="dom-if" if="[[!_selectedDateDisplayFormatIsDefault(selectedDateDisplayFormat)]]">
            [[formatDateForDisplay(value, readonly)]]
          </template>
        </div>

        <template is="dom-if" if="[[showXBtn(readonly, disabled, value)]]">
          <iron-icon
            icon="clear"
            slot="suffix"
            on-tap="_clearData"
            title="Clear"
            tabindex="0"
            hidden$="[[clearBtnInsideDr]]"
            on-keydown="activateOnEnterAndSpace"
          ></iron-icon>
        </template>

        <template is="dom-if" if="[[errorMessage]]">
          <paper-input-error aria-live="assertive" slot="add-on">[[errorMessage]]</paper-input-error>
        </template>
      </paper-input-container>
      <focus-trap>
        <calendar-lite
          id="calendar"
          on-date-change="datePicked"
          date="[[inputDate]]"
          min-date="[[minDate]]"
          max-date="[[maxDate]]"
          hidden$="[[!opened]]"
          on-keydown="closeCalendarOnEsc"
        >
          <div class="actions" slot="actions">
            <template is="dom-if" if="[[!readonly]]">
              <paper-button raised class="clear-btn" on-tap="_clearData" hidden$="[[!clearBtnInsideDr]]"
                >Clear
              </paper-button>
            </template>

            <template is="dom-if" if="[[!closeOnSelect]]">
              <paper-button raised class="close-btn" on-tap="toggleCalendar">Close</paper-button>
            </template>
          </div>
        </calendar-lite>
      </focus-trap>
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
      closeOnSelect: {
        type: Boolean,
        value: true
      },
      _clearDateInProgress: Boolean,
      _stopDateCompute: Boolean,
      autoValidate: {
        type: Boolean,
        value: false
      },
      minDate: Date,
      maxDate: Date,
      fireDateHasChanged: {
        type: Boolean,
        value: false
      },
      minDateErrorMsg: {
        type: String,
        value: 'Date is earlier than min date'
      },
      maxDateErrorMsg: {
        type: String,
        value: 'Date exceeds max date'
      },
      requiredErrorMsg: {
        type: String,
        value: 'This field is required'
      },
      selectedDateDisplayFormat: {
        // to display selected date in a different format than default 'YYYY-MM-DD'  Ex: other option would be 'D MMM YYYY'
        type: String,
        value: 'default'
      },
      inputDateFormat: {
        // datepicker works internally with date in format 'YYYY-MM-DD', in case input value has a different format, this can be specified using this property
        type: String,
        value: ''
      }
    };
  }

  static get observers() {
    return ['computeDate(monthInput, dayInput, yearInput)'];
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

  activateOnEnterAndSpace(event) {
    if ((event.key === ' ' && !event.ctrlKey) || event.key === 'Enter') {
      // Cancel the default action, if needed
      event.preventDefault();
      // Trigger the button element with a click
      event.target.click();
      return false;
    }
  }

  closeCalendarOnEsc(event) {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.target.parentNode.host.set('opened', false);
    }
  }

  _getDateString(date) {
    let month = '' + (date.getMonth() + 1);
    let day = '' + date.getDate();
    let year = date.getFullYear();

    month = month.length < 2 ? '0' + month : month;
    day = day.length < 2 ? '0' + day : day;

    return [year, month, day].join('-');
  }

  _getTabindexByReadonly(readOnly) {
    return readOnly ? '-1' : '0';
  }

  _triggerDateChangeCustomEvent(date) {
    if (this.fireDateHasChanged) {
      this.dispatchEvent(
        new CustomEvent('date-has-changed', {
          detail: {date: date},
          bubbles: true,
          composed: true
        })
      );
    }
  }

  datePicked(event) {
    if (this._clearDateInProgress) {
      this._clearDateInProgress = false;
      return;
    }
    let date = event.detail.date;

    this._setDayMonthYearInInputElements(date);

    this.value = this._getDateString(date);

    this._triggerDateChangeCustomEvent(date);

    if (this.closeOnSelect) {
      _closeDatepickers();
    }
    this._stopDateCompute = false;
  }

  _setDayMonthYearInInputElements(date) {
    let month = '' + (date.getMonth() + 1);
    let day = '' + date.getDate();
    let year = date.getFullYear();

    month = month.length < 2 ? '0' + month : month;
    day = day.length < 2 ? '0' + day : day;

    this._stopDateCompute = true;

    this.set('monthInput', month);
    this.set('dayInput', day);
    this.set('yearInput', year);
  }

  computeDate(month, day, year) {
    if (this.autoValidate) {
      // this.set('_stopDateCompute', false);
      this.set('invalid', !this._isValidYear() || !this._isValidMonth() || !this._isValidDay());
      if (this.invalid) {
        this.errorMessage = 'Invalid date';
      }
    }

    if (month !== undefined && day !== undefined && year !== undefined) {
      if (this._stopDateCompute) {
        // prevent setting wrong value when year/month/day are set by datepiker in datePicked
        return;
      }

      if (this.monthInput || this.dayInput || this.yearInput) {
        if (this._isValidYear() && this._isValidMonth() && this._isValidDay() && this._enteredDateIsValid()) {
          let newDate = new Date(year, month - 1, day);

          this.set('inputDate', newDate);
          this.set('value', year + '-' + month + '-' + day);
        }
      } else {
        this.set('value', null);
      }
    }
  }
  toggleCalendarFromPaperInput() {
    if (this._selectedDateDisplayFormatIsDefault(this.selectedDateDisplayFormat)) {
      return;
    }

    this.toggleCalendar();
  }

  toggleCalendarFromIcon() {
    if (this._selectedDateDisplayFormatIsDefault(this.selectedDateDisplayFormat)) {
      this.toggleCalendar();
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

  _toggelOnKeyPressFromPaperInput(event) {
    if (this._selectedDateDisplayFormatIsDefault(this.selectedDateDisplayFormat)) {
      return;
    }

    this._toggelOnKeyPress(event);
  }
  _toggelOnKeyPressFromIcon(event) {
    if (this._selectedDateDisplayFormatIsDefault(this.selectedDateDisplayFormat)) {
      this._toggelOnKeyPress(event);
    }
  }
  _toggelOnKeyPress(event) {
    if (!this.readonly) {
      if (event.which === 13 || event.button === 0) {
        this.toggleCalendar();
      }
    }
  }

  _clearData(e) {
    if (e) {
      e.preventDefault();
      e.stopImmediatePropagation();
    }

    this._clearDateInProgress = true;
    this.set('inputDate', null);
    this.set('monthInput', undefined);
    this.set('dayInput', undefined);
    this.set('yearInput', undefined);
    this.set('value', null);
    if (this.autoValidate) {
      this.validate();
    } else {
      this.set('invalid', false);
    }
    this._triggerDateChangeCustomEvent(this.value);
  }

  _isValidYear() {
    if (this.yearInput !== undefined) {
      return this.yearInput >= 1970 && this.yearInput < 9999 && String(this.yearInput).length === 4;
    }
    return false;
  }

  _isValidMonth() {
    return Number(this.monthInput) >= 1 && Number(this.monthInput) <= 12;
  }

  _isValidDay() {
    return this.dayInput >= 1 && this.dayInput <= 31;
  }

  _enteredDateIsValid() {
    let newDate = new Date(this.yearInput, this.monthInput - 1, this.dayInput);

    let newYear = newDate.getFullYear();
    let newMonth = newDate.getMonth() + 1;
    let newDay = newDate.getDate();

    let valid =
      newMonth === Number(this.monthInput) && newDay === Number(this.dayInput) && newYear === Number(this.yearInput);
    if (!valid) {
      this.errorMessage = 'Invalid date';
    }
    return valid;
  }

  validate() {
    let valid = true;

    valid = this.requiredValidation() && this.maxDateValidation() && this.minDateValidation();

    if (valid) {
      if (this.yearInput || this.monthInput || this.dayInput) {
        valid = this._enteredDateIsValid();
      }
    }

    this.set('invalid', !valid);
    return valid;
  }

  maxDateValidation() {
    if (this.maxDate && this.value) {
      let valid = dateLib(this.value, controlFormat) <= this.maxDate;
      if (!valid) {
        this.errorMessage = this.maxDateErrorMsg;
      }
      return valid;
    }
    return true;
  }

  minDateValidation() {
    if (this.minDate && this.value) {
      let valid = dateLib(this.value, controlFormat) >= this.minDate;
      if (!valid) {
        this.errorMessage = this.minDateErrorMsg;
      }
      return valid;
    }
    return true;
  }

  requiredValidation() {
    if (this.required) {
      let valid = this._isValidMonth() && this._isValidDay() && this._isValidYear() && this._enteredDateIsValid();
      if (!valid) {
        this.errorMessage = this.requiredErrorMsg
          ? this.requiredErrorMsg
          : this.maxDate
          ? 'This field is required'
          : this.errorMessage;
      }
      return valid;
    }
    return true;
  }

  _valueChanged(newValue) {
    if (!newValue) {
      if (this.monthInput || this.dayInput || this.yearInput) {
        this._clearData();
      }
      return;
    }
    if (this.inputDateFormat) {
      const formattedDate = dateLib(newValue, this.inputDateFormat, true);
      if (formattedDate.isValid()) {
        newValue = formattedDate.format(controlFormat);
      }
    }
    const dData = newValue.split('-');
    if (dData.length !== 3) {
      // value need to be yyyy-mm-dd format
      return;
    }
    this._stopDateCompute = true;
    this.set('monthInput', dData[1]);
    this.set('dayInput', dData[2].slice(0, 2));
    this.set('yearInput', dData[0]);
    this._stopDateCompute = false;

    const d = new Date(dData[0], Number(dData[1]) - 1, dData[2]);
    if (d.toString() !== 'Invalid Date') {
      this.set('inputDate', d);
      this._triggerDateChangeCustomEvent(this.value);
    }
  }

  _handleOnBlur() {
    if (this.autoValidate) {
      this.validate();
    }
  }

  formatDateForDisplay(selectedDt, readonly) {
    if (!selectedDt) {
      return readonly ? '—' : '';
    }
    return dateLib(selectedDt, controlFormat).format(this.selectedDateDisplayFormat);
  }

  showXBtn(readonly, disabled, selectedDt) {
    return !readonly && !disabled && selectedDt;
  }

  _selectedDateDisplayFormatIsDefault() {
    return this.selectedDateDisplayFormat === 'default';
  }
}

window.customElements.define('datepicker-lite', DatePickerLite);
