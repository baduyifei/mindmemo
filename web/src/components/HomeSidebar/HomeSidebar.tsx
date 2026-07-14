import classNames from "classnames";
import { useEffect, useState } from "react";
import MemoCalendar from "@/components/MemoCalendar";
import SearchBar from "@/components/SearchBar";
import UserStatisticsView from "@/components/UserStatisticsView";
import { memoServiceClient } from "@/grpcweb";
import useCurrentUser from "@/hooks/useCurrentUser";
import { useMemoStore } from "@/store/v1";
import TagsSection from "./TagsSection";

interface Props {
  className?: string;
  selectedDate?: string;
  onDateSelect: (date?: string) => void;
}

const HomeSidebar = (props: Props) => {
  const currentUser = useCurrentUser();
  const memoStore = useMemoStore();
  const [memoStats, setMemoStats] = useState<Record<string, number>>({});
  const [isRequestingStats, setIsRequestingStats] = useState(false);
  const memos = Object.values(memoStore.getState().memoMapByName);

  useEffect(() => {
    if (memos.length === 0) {
      return;
    }

    (async () => {
      setIsRequestingStats(true);
      try {
        const { stats } = await memoServiceClient.getUserMemosStats({
          name: currentUser.name,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        });
        setMemoStats(stats);
      } finally {
        setIsRequestingStats(false);
      }
    })();
  }, [memos.length, currentUser.name]);

  return (
    <aside
      className={classNames(
        "relative w-full h-auto max-h-screen overflow-auto hide-scrollbar flex flex-col justify-start items-start",
        props.className,
      )}
    >
      <SearchBar />
      <MemoCalendar
        stats={memoStats}
        selectedDate={props.selectedDate}
        isRequesting={isRequestingStats}
        onDateSelect={props.onDateSelect}
      />
      <UserStatisticsView stats={memoStats} isRequesting={isRequestingStats} />
      <TagsSection />
    </aside>
  );
};

export default HomeSidebar;
