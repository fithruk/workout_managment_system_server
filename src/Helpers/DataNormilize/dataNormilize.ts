import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

function normalizeToUTCMinute(date: Date | string): Date {
  return dayjs(date).utc().second(0).millisecond(0).toDate();
}

export { normalizeToUTCMinute };
