import * as moment from 'moment';

export function isBetweenIgnoringDate(
  dateToBeCompared: moment.Moment,
  dateStart: moment.Moment,
  dateEnd: moment.Moment,
): boolean {
  return dateToBeCompared.isBetween(dateStart, dateEnd);
}
