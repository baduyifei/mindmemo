import { Tooltip } from "@mui/joy";
import classNames from "classnames";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import {
  buildMemoCalendarDays,
  formatMemoDateKey,
  getLocalizedMonthLabel,
  getLocalizedWeekdayLabels,
  getMemoActivityIntensityClass,
} from "@/helpers/memoCalendar";
import Icon from "./Icon";

interface Props {
  initialYear: number;
  stats: Record<string, number>;
  selectedDate?: string;
  onClose: () => void;
  onDateSelect: (dateKey: string) => void;
}

interface YearMonthProps {
  year: number;
  month: number;
  locale: string;
  stats: Record<string, number>;
  selectedDate?: string;
  todayKey: string;
  onDateSelect: (dateKey: string) => void;
}

const YearMonth = (props: YearMonthProps) => {
  const { year, month, locale, stats, selectedDate, todayKey, onDateSelect } = props;
  const days = useMemo(() => buildMemoCalendarDays(new Date(year, month, 1)), [year, month]);
  const weekdayLabels = useMemo(() => getLocalizedWeekdayLabels(locale), [locale]);
  const monthLabel = useMemo(() => getLocalizedMonthLabel(year, month, locale), [year, month, locale]);

  return (
    <section className="min-w-0 rounded-xl border border-zinc-200/80 bg-zinc-50/70 p-3 dark:border-zinc-700 dark:bg-zinc-900/60">
      <h3 className="mb-2 text-[11px] font-semibold tracking-[0.12em] text-zinc-500 dark:text-zinc-400">{monthLabel}</h3>
      <div className="grid grid-cols-7 gap-1" aria-hidden="true">
        {weekdayLabels.map((label, index) => (
          <div
            key={`${label}-${index}`}
            className="flex h-5 items-center justify-center text-[10px] font-medium text-zinc-400 dark:text-zinc-500"
          >
            {label}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map(({ date, dateKey, isCurrentMonth }) => {
          if (!isCurrentMonth) {
            return (
              <div
                key={dateKey}
                className="flex aspect-square min-w-0 select-none items-center justify-center rounded-md text-[11px] text-zinc-300 dark:text-zinc-700"
                aria-hidden="true"
              >
                {date.getDate()}
              </div>
            );
          }

          const count = stats[dateKey] ?? 0;
          const isSelected = selectedDate === dateKey;
          const isToday = todayKey === dateKey;
          const dateButton = (
            <button
              key={dateKey}
              type="button"
              data-date={dateKey}
              data-memo-count={count}
              aria-label={`${dateKey}，${count} 条备忘录${isSelected ? "，已筛选" : ""}`}
              aria-pressed={isSelected}
              className={classNames(
                "flex aspect-square min-w-0 select-none items-center justify-center rounded-md border text-[11px] font-medium leading-none transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-zinc-900",
                getMemoActivityIntensityClass(count),
                isToday ? "border-zinc-500 dark:border-zinc-400" : "border-transparent",
                isSelected && "ring-2 ring-blue-700 ring-offset-1 dark:ring-blue-300 dark:ring-offset-zinc-900",
              )}
              onClick={() => onDateSelect(dateKey)}
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
    </section>
  );
};

const MemoYearCalendarDialog = (props: Props) => {
  const { initialYear, stats, selectedDate, onClose, onDateSelect } = props;
  const { i18n } = useTranslation();
  const now = new Date();
  const currentYear = now.getFullYear();
  const todayKey = formatMemoDateKey(now);
  const [visibleYear, setVisibleYear] = useState(initialYear);
  const locale = i18n.resolvedLanguage || i18n.language || "en";
  const todayLabel = locale.toLowerCase().startsWith("zh") ? "今天" : "Today";

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-[1000] overflow-y-auto bg-black/60 px-3 py-4 backdrop-blur-[1px] sm:px-5 sm:py-8"
      role="presentation"
      onMouseDown={onClose}
    >
      <section
        role="dialog"
        data-testid="memo-year-calendar-dialog"
        data-year={visibleYear}
        aria-modal="true"
        aria-labelledby="memo-year-calendar-title"
        className="mx-auto w-full max-w-6xl rounded-2xl border border-zinc-200 bg-white p-4 shadow-2xl dark:border-zinc-700 dark:bg-zinc-800 sm:p-6"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="mb-4 flex items-center justify-between gap-3 sm:mb-5">
          <h2 id="memo-year-calendar-title" className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            {visibleYear}
          </h2>
          <div className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-zinc-50 p-1 dark:border-zinc-700 dark:bg-zinc-900">
            <button
              type="button"
              data-testid="memo-year-previous"
              className="flex h-8 w-8 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-white hover:text-zinc-900 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
              aria-label="上一年"
              onClick={() => setVisibleYear((year) => year - 1)}
            >
              <Icon.ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              data-testid="memo-year-today"
              className="h-8 rounded-md px-2.5 text-xs font-medium text-zinc-500 transition-colors hover:bg-white hover:text-zinc-900 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-default disabled:opacity-40 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
              disabled={visibleYear === currentYear}
              onClick={() => setVisibleYear(currentYear)}
            >
              {todayLabel}
            </button>
            <button
              type="button"
              data-testid="memo-year-next"
              className="flex h-8 w-8 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-white hover:text-zinc-900 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
              aria-label="下一年"
              onClick={() => setVisibleYear((year) => year + 1)}
            >
              <Icon.ChevronRight className="h-4 w-4" />
            </button>
            <div className="mx-0.5 h-5 w-px bg-zinc-200 dark:bg-zinc-700" aria-hidden="true" />
            <button
              type="button"
              data-testid="memo-year-close"
              className="flex h-8 w-8 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-white hover:text-zinc-900 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
              aria-label="关闭"
              onClick={onClose}
            >
              <Icon.X className="h-4 w-4" />
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 12 }, (_, month) => (
            <YearMonth
              key={`${visibleYear}-${month}`}
              year={visibleYear}
              month={month}
              locale={locale}
              stats={stats}
              selectedDate={selectedDate}
              todayKey={todayKey}
              onDateSelect={onDateSelect}
            />
          ))}
        </div>
      </section>
    </div>,
    document.body,
  );
};

export default MemoYearCalendarDialog;
