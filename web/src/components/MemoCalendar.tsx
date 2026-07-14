import { Tooltip } from "@mui/joy";
import classNames from "classnames";
import { useMemo, useState } from "react";
import Icon from "./Icon";

interface Props {
  stats: Record<string, number>;
  selectedDate?: string;
  isRequesting?: boolean;
  onDateSelect: (date?: string) => void;
}

interface CalendarDay {
  date: Date;
  dateKey: string;
  isCurrentMonth: boolean;
}

const WEEKDAY_LABELS = ["一", "二", "三", "四", "五", "六", "日"];

const formatDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getIntensityClass = (count: number) => {
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

const buildCalendarDays = (visibleMonth: Date): CalendarDay[] => {
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
      dateKey: formatDateKey(date),
      isCurrentMonth: date.getMonth() === month,
    };
  });
};

const MemoCalendar = (props: Props) => {
  const { stats, selectedDate, isRequesting = false, onDateSelect } = props;
  const now = new Date();
  const todayKey = formatDateKey(now);
  const [visibleMonth, setVisibleMonth] = useState(() => new Date(now.getFullYear(), now.getMonth(), 1));
  const days = useMemo(() => buildCalendarDays(visibleMonth), [visibleMonth]);
  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth() + 1;

  const changeMonth = (offset: number) => {
    setVisibleMonth((currentMonth) => new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1));
    if (selectedDate) {
      onDateSelect(undefined);
    }
  };

  const handleDateSelect = (dateKey: string) => {
    onDateSelect(selectedDate === dateKey ? undefined : dateKey);
  };

  return (
    <section
      data-testid="memo-activity-calendar"
      className="mt-2 w-full rounded-md border border-gray-200 bg-zinc-50 px-3 py-2.5 text-gray-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-gray-300"
      aria-label="备忘录月历热力图"
    >
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <h2 className="text-sm font-semibold tracking-tight text-zinc-800 dark:text-zinc-200">{`${year}年${month}月`}</h2>
          {isRequesting && <Icon.Loader className="h-3.5 w-3.5 animate-spin text-zinc-400" aria-label="正在载入统计" />}
        </div>
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-zinc-200 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
            aria-label="上一个月"
            onClick={() => changeMonth(-1)}
          >
            <Icon.ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-zinc-200 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
            aria-label="下一个月"
            onClick={() => changeMonth(1)}
          >
            <Icon.ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1" aria-hidden="true">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="flex h-5 items-center justify-center text-[11px] font-medium text-zinc-400 dark:text-zinc-500">
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map(({ date, dateKey, isCurrentMonth }) => {
          const count = stats[dateKey] ?? 0;
          const isSelected = selectedDate === dateKey;
          const isToday = todayKey === dateKey;

          if (!isCurrentMonth) {
            return (
              <div
                key={dateKey}
                className="flex aspect-square min-w-0 select-none items-center justify-center rounded-md text-xs text-zinc-300 dark:text-zinc-700"
                aria-hidden="true"
              >
                {date.getDate()}
              </div>
            );
          }

          const tooltipText = count === 0 ? `${dateKey}：没有备忘录` : `${dateKey}：${count} 条备忘录`;
          return (
            <Tooltip key={dateKey} title={tooltipText} placement="top" arrow>
              <button
                type="button"
                data-date={dateKey}
                data-memo-count={count}
                aria-label={`${dateKey}，${count} 条备忘录${isSelected ? "，已筛选" : ""}`}
                aria-pressed={isSelected}
                className={classNames(
                  "flex aspect-square min-w-0 select-none items-center justify-center rounded-md border text-xs font-medium leading-none transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-zinc-900",
                  getIntensityClass(count),
                  isToday ? "border-zinc-500 dark:border-zinc-400" : "border-transparent",
                  isSelected && "ring-2 ring-blue-700 ring-offset-1 dark:ring-blue-300 dark:ring-offset-zinc-900",
                )}
                onClick={() => handleDateSelect(dateKey)}
              >
                {date.getDate()}
              </button>
            </Tooltip>
          );
        })}
      </div>

      {selectedDate && (
        <div
          className="mt-2 flex items-center justify-between border-t border-zinc-200 pt-2 text-[11px] dark:border-zinc-800"
          aria-live="polite"
        >
          <span className="truncate text-zinc-500 dark:text-zinc-400">已筛选 {selectedDate}</span>
          <button
            type="button"
            className="ml-2 shrink-0 font-medium text-blue-600 hover:text-blue-800 focus-visible:outline-none focus-visible:underline dark:text-blue-400 dark:hover:text-blue-300"
            onClick={() => onDateSelect(undefined)}
          >
            清除
          </button>
        </div>
      )}
    </section>
  );
};

export default MemoCalendar;
