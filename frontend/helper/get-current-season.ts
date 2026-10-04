import dayjs from "dayjs";
import { Season } from '../enums';

export default function getCurrentSeason() {
    const now = dayjs();
    const month = now.month()
    const year = now.year()

    let season;
    if (month >= 0 && month <= 2) {
      season = Season.winter;
    } else if (month >= 3 && month <= 5) {
      season = Season.spring;
    } else if (month >= 6 && month <= 8) {
      season = Season.summer;
    } else {
      season = Season.fall;
    }

    return { year, season }
  }