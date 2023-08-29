import * as moment from 'moment';

export function isBetweenIgnoringDate(
  dateToBeCompared: moment.Moment,
  dateStart: moment.Moment,
  dateEnd: moment.Moment,
): boolean {
  return dateToBeCompared
    .clone()
    .year(dateStart.year())
    .month(dateStart.month())
    .date(dateStart.date())
    .isBetween(
      dateStart,
      dateEnd
        .clone()
        .year(dateStart.year())
        .month(dateStart.month())
        .date(dateStart.date()),
    );
}
