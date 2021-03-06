/**
 * DO NOT EDIT
 *
 * This file was automatically generated by
 *   https://github.com/Polymer/tools/tree/master/packages/gen-typescript-declarations
 *
 * To modify these typings, edit the source file(s):
 *   datepicker-lite.js
 */


// tslint:disable:variable-name Describing an API that's defined elsewhere.
// tslint:disable:no-any describes the API as best we are able today

import {PolymerElement, html} from '@polymer/polymer/polymer-element.js';

import {GestureEventListeners} from '@polymer/polymer/lib/mixins/gesture-event-listeners.js';

declare class DatePickerLite extends
  GestureEventListeners(
    PolymerElement) {
  value: string | null | undefined;
  readonly: boolean | null | undefined;
  required: boolean | null | undefined;
  errorMessage: string | null | undefined;
  disabled: boolean | null | undefined;
  label: string | null | undefined;
  monthInput: number | null | undefined;
  dayInput: number | null | undefined;
  yearInput: number | null | undefined;
  invalid: boolean | null | undefined;
  inputDate: Date | null | undefined;
  opened: boolean | null | undefined;
  clearBtnInsideDr: boolean | null | undefined;
  closeOnSelect: boolean | null | undefined;
  _clearDateInProgress: boolean | null | undefined;
  _stopDateCompute: boolean | null | undefined;
  autoValidate: boolean | null | undefined;
  minDate: Date | null | undefined;
  maxDate: Date | null | undefined;
  fireDateHasChanged: boolean | null | undefined;
  minDateErrorMsg: string | null | undefined;
  maxDateErrorMsg: string | null | undefined;
  requiredErrorMsg: string | null | undefined;
  selectedDateDisplayFormat: string | null | undefined;
  inputDateFormat: string | null | undefined;
  connectedCallback(): void;
  _getDateString(date: any): any;
  datePicked(event: any): void;
  computeDate(month: any, day: any, year: any): void;
  toggleCalendar(): void;
  _toggelOnKeyPress(event: any): void;
  _clearData(): void;
  _isValidYear(): any;
  _isValidMonth(): any;
  _isValidDay(): any;
  _enteredDateIsValid(): any;
  validate(): any;
  maxDateValidation(): any;
  minDateValidation(): any;
  requiredValidation(): any;
  _valueChanged(newValue: any): void;
  _handleOnBlur(): void;
}

export default DatePickerLite;

declare global {

  interface HTMLElementTagNameMap {
    "datepicker-lite": DatePickerLite;
  }
}
