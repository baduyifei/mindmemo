import classNames from "classnames";
import Icon from "@/components/Icon";
import { useFilterStore } from "@/store/module";
import { Visibility } from "@/types/proto/api/v2/memo_service";
import { useTranslate } from "@/utils/i18n";

const FILTER_OPTIONS = [
  {
    visibility: Visibility.PUBLIC,
    labelKey: "home.smart-filter.public-only" as const,
    icon: Icon.Globe2,
  },
  {
    visibility: Visibility.PRIVATE,
    labelKey: "home.smart-filter.private-only" as const,
    icon: Icon.Lock,
  },
];

const SmartFilterSection = () => {
  const t = useTranslate();
  const filterStore = useFilterStore();
  const activeVisibility = filterStore.state.visibility;

  const handleVisibilityChange = (visibility: Visibility) => {
    filterStore.setMemoVisibilityFilter(activeVisibility === visibility ? undefined : visibility);
  };

  return (
    <section className="mt-3 w-full rounded-lg border border-gray-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-start justify-between gap-2">
        <h2 className="text-sm font-medium leading-5 text-gray-700 dark:text-gray-200">{t("home.smart-filter.title")}</h2>
        <span className="pt-0.5 text-[11px] leading-4 text-gray-400 dark:text-gray-500">{t("home.smart-filter.combine-hint")}</span>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2">
        {FILTER_OPTIONS.map((option) => {
          const active = activeVisibility === option.visibility;
          const OptionIcon = option.icon;

          return (
            <button
              key={option.visibility}
              type="button"
              aria-pressed={active}
              className={classNames(
                "relative flex h-9 items-center justify-center gap-1.5 rounded-md border px-2 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-900",
                active
                  ? "border-blue-500 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:border-blue-500 dark:bg-blue-950/60 dark:text-blue-300 dark:hover:bg-blue-950"
                  : "border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300 hover:bg-gray-100 dark:border-zinc-700 dark:bg-zinc-800/70 dark:text-gray-300 dark:hover:border-zinc-600 dark:hover:bg-zinc-800",
              )}
              onClick={() => handleVisibilityChange(option.visibility)}
            >
              <OptionIcon className="h-3.5 w-3.5 shrink-0" />
              <span>{t(option.labelKey)}</span>
              {active && (
                <span className="absolute right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-blue-600 text-white dark:bg-blue-500">
                  <Icon.Check className="h-2.5 w-2.5" strokeWidth={3} />
                </span>
              )}
            </button>
          );
        })}
      </div>

      <p
        aria-live="polite"
        className={classNames(
          "mt-2 min-h-4 text-[11px] leading-4 text-gray-400 transition-opacity dark:text-gray-500",
          activeVisibility ? "opacity-100" : "opacity-0",
        )}
      >
        {t("home.smart-filter.click-again-to-clear")}
      </p>
    </section>
  );
};

export default SmartFilterSection;
