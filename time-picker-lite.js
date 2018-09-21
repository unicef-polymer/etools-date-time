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
                             invalid="{{invalid}}" >
        <label hidden$=[[!label]] slot="label">[[label]]</label>
        <div slot="input" class="paper-input-input">
          <input value="{{hoursInput::input}}" readonly$="[[readonly]]" placeholder="hh" type="number" min="1" max="23">:
          <input value="{{minutesInput::input}}" readonly$="[[readonly]]" placeholder="mm" type="number" min="1" max="59">
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

    console.log("new value", newValue);
    // console.log(this.hoursInput, this.minutesInput);

  }

  computeTime(hours, minutes) {
    // if (this._dateFieldsPopulatedByDatepicker) {
    //   // prevent setting wrong value when year/month/day are set by datepiker in datePicked
    //   return;
    // }

    // console.log(this.hoursInput);
    // console.log(this.minutesInput);

    if (hours !== undefined && hours >= 1) {
      console.log("hours", hours);
      hours = hours.length < 2 ? '0' + hours : hours;
      this.set('hoursInput', hours);
    }

    if (minutes !== undefined && minutes >= 1) {
      console.log("minutes ", minutes);
      minutes = minutes.length < 2 ? '0' + minutes : minutes;
      this.set('minutesInput', minutes);
    }


    this.set('value', hours + ':' + minutes);
    // if (this._isValidYear() && this._isValidMonth() &&
    //     this._isValidDay() && this._enteredDateIsValid() ) {
    //   let newDate = new Date(year, month - 1, day);
    //   this.set('inputDate', newDate);
    // }
  }

  _clearData() {
    // this._clearDateInProgress = true;
    // this.set('inputDate', new Date());
    this.set('hoursInput', undefined);
    this.set('minutesInput', undefined);
    this.set('value', null);
    this.set('invalid', false);
  }

  validate() {
    if (this.hoursInput === undefined || this.minutesInput === undefined) {
      this.set('invalid', true);
      return false;
    } else {
      this.set('invalid', false);
      return true;
    }
  }




}


window.customElements.define('timepicker-lite', TimePickerLite);
