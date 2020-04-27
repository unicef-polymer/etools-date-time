# Etools date and time fields

Polymer 3 components

## Install

`$ npm i --save @unicef-polymer/etools-date-time`

## Description

Polymer 3 components used for date and time fields.

### Components

- \<datepicker-lite\>
- \<calendar-lite\>
- \<time-input\>

### Calendar component features

1. Set min, max date or default date,
2. Select Multiple dates(consequent or random)
3. Disable week days(example disable all Sundays or Fridays)
4. Disable an array of dates(example 1st and 3rd of this month)
5. triggers an event on date change(So you can update the value of an input field)
6. triggers an event on month change(So you can set different disable dates for different months)

```html
<calendar-lite></calendar-lite>

<calendar-lite id="someid" disabled-week-day='["Fri","Sun"]' multi-select='{"max":3,"consequent":true}'>
</calendar-lite>
```

You can attach date-change event listener to it as shown below

```javascript
// called whenever a user selects/change a date
document.querySelector('#someid').addEventListener('date-change', function (e) {
  console.log(e.detail.date); //update input values...
});
```

You can disable week days by passing an array as shown below.

```html
<calendar-lite id="someid" disabled-week-day='["Fri","Sun"]'></calendar-lite>
```

You can disable a bunch of days by passing an array as shown below.

```html
<calendar-lite id="someid" disabled-days="[4,20,27]"></calendar-lite>
```

Here you may get a doubt that "How to disable different dates for different months?"

Answer is, you can update the disable dates on `month-change` event as shown below.

```javascript
document.querySelector('#someid').addEventListener('month-change', function (e) {
  //takecare month numbering starts from 0
  if (e.detail.date.getMonth() == 4) {
    document.querySelector('#someid').disabledDays = [1];
  } else {
    document.querySelector('#someid').disabledDays = [7, 8];
  }
});
```

You can select multiple days by passing an Object to `multi-select` attribute as shown below.

```html
<calendar-lite
  id="someid"
  multi-select='{"max":3,"consequent":false}'
  disabled-week-day='["Fri"]'
  disabled-days="[2,3,4]"
>
</calendar-lite>
```

To get the selected multiple dates, use below listener

```javascript
document.querySelector('#excalendar').addEventListener('multiselect', function (e) {
  console.log(e.detail.dates); // array of selected dates
});
```

In Object multi-select: `max` is nothing but maximum number of days that can be selected, if `consequent` is true it will select the days in consequent.

you can provide min and max dates, such that calendar-lite will disable the remaining dates.

```html
<calendar-lite
  id="someid"
  min-date="2016,12,9"
  multi-select='{"max":3,"consequent":false}'
  disabled-week-day='["Fri"]'
  disabled-days="[2,3,4]"
>
</calendar-lite>
```

min-date and max-date format should be yyyy-mm-dd.

By default present(today) day is selected, you can set a default date as shown below

```html
<calendar-lite id="someid" date="01/07/2015"> </calendar-lite>
```

### Time input component features

Is a lite and simple time picker. The time-input uses 24h format input.

```html
<time-input label="Time picker" value="18:23"> </time-input>
```

### Datepicker-lite component features

Is a lite and simple date picker.

1. Set min, max date or default date,
2. Set date input format and/or selected date display format

```html
<calendar-lite></calendar-lite>

<calendar-lite id="someid" max-date="[[getCurrentDate()]]" min-date="[[getMinDate()]]"> </calendar-lite>
```

```html
<datepicker-lite
  class="start-date"
  label="Start date"
  value="{{data.start_date}}"
  input-date-format="DD-MMM-YYYY"
  selected-date-display-format="DD-MMM-YYYY"
  error-message=""
  required
>
</datepicker-lite>
```
