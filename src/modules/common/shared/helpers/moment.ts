import moment from 'moment';

export function isServiceOpen(dateStart: Date, dateEnd: Date): boolean {
  return moment().isBetween(dateStart, dateEnd);
}
