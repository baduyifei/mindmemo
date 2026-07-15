import { Tooltip } from "@mui/joy";
import classNames from "classnames";
import { useCallback, useMemo, useState } from "react";
import { buildMemoCalendarDays, formatMemoDateKey, getMemoActivityIntensityClass } from "@/helpers/memoCalendar";
import Icon from "./Icon";
import MemoYearCalendarDialog from "./MemoYearCalendarDialog";

interface Props {
  stats: Record<string, number>;
  selectedDate?: string;
  isRequesting?: boolean;
  onDateSelect: (date?: string) => void;
}

const WEEKDAY_LABELS = ["一", "二", "三", "四", "五", "六", "日"];

const MemoCalendar = (props: Props) => {
  const { stats, selectedDate, isRequesting = false, onDateSelect } = props;
  const now = new Date();
  const todayKey = formatMemoDateKey(now);
  const [visibleMonth, setVisibleMonth] = useState(() => new Date(now.getFullYear(), now.getMonth(), 1));
  const [isYearCalendarOpen, setIsYearCalendarOpen] = useState(false);
  const days = useMemo(() => buildMemoCalendarDays(visibleMonth), [visibleMonth]);
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

  const closeYearCalendar = useCallback(() => setIsYearCalendarOpen(false), []);

  const handleYearDateSelect = (dateKey: string) => {
    const [selectedYear, selectedMonth] = dateKey.split("-").map(Number);
    setVisibleMonth(new Date(selectedYear, selectedMonth - 1, 1));
    handleDateSelect(dateKey);
    closeYearCalendar();
  };

  return (
    <section
      data-testid="memo-activity-calendar"
      className="mt-2 w-full rounded-md border border-gray-200 bg-zinc-50 px-3 py-2.5 text-gray-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-gray-300"
      aria-label="备忘录月历热力图"
    >
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            data-testid="memo-year-calendar-trigger"
            className="-ml-1 cursor-pointer rounded-md px-1 py-0.5 text-sm font-semibold tracking-tight text-zinc-800 transition-colors hover:bg-zinc-200 hover:text-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-zinc-200 dark:hover:bg-zinc-800 dark:hover:text-white"
            aria-label={`查看 ${year} 年度热力图`}
            aria-haspopup="dialog"
            onClick={() => setIsYearCalendarOpen(true)}
          >
            {`${year}年${month}月`}
          </button>
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

          const dateButton = (
            <button
              key={dateKey}
              type="button"
              data-date={dateKey}
              data-memo-count={count}
              aria-label={`${dateKey}，${count} 条备忘录${isSelected ? "，已筛选" : ""}`}
              aria-pressed={isSelected}
              className={classNames(
                "flex aspect-square min-w-0 select-none items-center justify-center rounded-md border text-xs font-medium leading-none transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-zinc-900",
                getMemoActivityIntensityClass(count),
                isToday ? "border-zinc-500 dark:border-zinc-400" : "border-transparent",
                isSelected && "ring-2 ring-blue-700 ring-offset-1 dark:ring-blue-300 dark:ring-offset-zinc-900",
              )}
              onClick={() => handleDateSelect(dateKey)}
            >
              {date.getDate()}
            </button>
          );

          return count > 0 ? (
            <Tooltip key={dateKey} title={`${dateKey}：${count} 条备忘录`} placement="top" arrow>
              {dateButton}
            </Tooltip>
          ) : (
            dateButton
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
      {isYearCalendarOpen && (
        <MemoYearCalendarDialog
          initialYear={year}
          stats={stats}
          selectedDate={selectedDate}
          onClose={closeYearCalendar}
          onDateSelect={handleYearDateSelect}
        />
      )}
    </section>
  );
};

export default MemoCalendar;
