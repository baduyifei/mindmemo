export interface CalendarDay {
  date: Date;
  dateKey: string;
  isCurrentMonth: boolean;
}

export const formatMemoDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const getMemoActivityIntensityClass = (count: number) => {
  if (count === 0) {
    return "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700";
  }
  if (count === 1) {
    return "bg-blue-100 text-zinc-700 hover:bg-blue-200 dark:bg-blue-950 dark:text-white dark:hover:bg-blue-900";
  }
  if (count <= 3) {
    return "bg-blue-300 text-zinc-700 hover:bg-blue-400 dark:bg-blue-800 dark:text-white dark:hover:bg-blue-700";
  }
  if (count <= 6) {
    return "bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500";
  }
  return "bg-blue-700 text-white hover:bg-blue-800 dark:bg-blue-500 dark:text-white dark:hover:bg-blue-400";
};

export const buildMemoCalendarDays = (visibleMonth: Date): CalendarDay[] => {
  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const mondayFirstOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cellCount = Math.ceil((mondayFirstOffset + daysInMonth) / 7) * 7;

  return Array.from({ length: cellCount }, (_, index) => {
    const date = new Date(year, month, index - mondayFirstOffset + 1);
    return {
      date,
      dateKey: formatMemoDateKey(date),
      isCurrentMonth: date.getMonth() === month,
    };
  });
};

export const getLocalizedWeekdayLabels = (locale: string) => {
  const formatter = new Intl.DateTimeFormat(locale, { weekday: "narrow" });
  const monday = new Date(2024, 0, 1);
  return Array.from({ length: 7 }, (_, index) => formatter.format(new Date(2024, 0, monday.getDate() + index)));
};

export const getLocalizedMonthLabel = (year: number, month: number, locale: string) => {
  const label = new Intl.DateTimeFormat(locale, { month: "short" }).format(new Date(year, month, 1));
  return label.toLocaleUpperCase(locale);
};
