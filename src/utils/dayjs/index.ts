import 'dayjs/locale/zh-cn';
import utc from 'dayjs/plugin/utc';
import dayjs from 'dayjs';

dayjs.extend(utc);
dayjs.locale('zh-cn')

export const formatDayjs = (date: string) => {
    return  dayjs.utc(date);
}