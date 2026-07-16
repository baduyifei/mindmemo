import { Button } from "@mui/joy";
import classNames from "classnames";
import { useCallback, useEffect, useRef, useState } from "react";
import Empty from "@/components/Empty";
import { HomeSidebar, HomeSidebarDrawer } from "@/components/HomeSidebar";
import Icon from "@/components/Icon";
import MemoEditor from "@/components/MemoEditor";
import showMemoEditorDialog from "@/components/MemoEditor/MemoEditorDialog";
import MemoFilter from "@/components/MemoFilter";
import MemoView from "@/components/MemoView";
import MobileHeader from "@/components/MobileHeader";
import { DEFAULT_LIST_MEMOS_PAGE_SIZE } from "@/helpers/consts";
import { getTimeStampByDate } from "@/helpers/datetime";
import useCurrentUser from "@/hooks/useCurrentUser";
import useFilterWithUrlParams from "@/hooks/useFilterWithUrlParams";
import useResponsiveWidth from "@/hooks/useResponsiveWidth";
import { useFilterStore } from "@/store/module";
import { useMemoList, useMemoStore } from "@/store/v1";
import { RowStatus } from "@/types/proto/api/v2/common";
import { useTranslate } from "@/utils/i18n";

const Home = () => {
  const t = useTranslate();
  const { md } = useResponsiveWidth();
  const user = useCurrentUser();
  const memoStore = useMemoStore();
  const memoList = useMemoList();
  const [selectedDate, setSelectedDate] = useState<string | undefined>();
  const [listedMemoNames, setListedMemoNames] = useState<string[]>([]);
  const [isRequesting, setIsRequesting] = useState(true);
  const nextPageTokenRef = useRef<string | undefined>(undefined);
  const requestSequenceRef = useRef(0);
  const { tag: tagQuery, text: textQuery } = useFilterWithUrlParams();
  const visibilityQuery = useFilterStore().state.visibility;
  const listedMemoNameSet = new Set(listedMemoNames);
  const sortedMemos = memoList.value
    .filter((memo) => listedMemoNameSet.has(memo.name) && memo.rowStatus === RowStatus.ACTIVE)
    .sort((a, b) => getTimeStampByDate(b.displayTime) - getTimeStampByDate(a.displayTime))
    .sort((a, b) => Number(b.pinned) - Number(a.pinned));

  useEffect(() => {
    const requestSequence = ++requestSequenceRef.current;
    nextPageTokenRef.current = undefined;
    fetchMemos(requestSequence);
  }, [selectedDate, tagQuery, textQuery, visibilityQuery]);

  const fetchMemos = async (requestSequence = requestSequenceRef.current) => {
    const pageToken = nextPageTokenRef.current;
    const filters = [`creator == "${user.name}"`, `row_status == "NORMAL"`, `order_by_pinned == true`];
    const contentSearch: string[] = [];
    if (tagQuery) {
      contentSearch.push(JSON.stringify(`#${tagQuery}`));
    }
    if (textQuery) {
      contentSearch.push(JSON.stringify(textQuery));
    }
    if (contentSearch.length > 0) {
      filters.push(`content_search == [${contentSearch.join(", ")}]`);
    }
    if (visibilityQuery) {
      filters.push(`visibilities == ["${visibilityQuery}"]`);
    }
    if (selectedDate) {
      const [year, month, day] = selectedDate.split("-").map(Number);
      const startOfDay = new Date(year, month - 1, day);
      const startOfNextDay = new Date(year, month - 1, day + 1);
      filters.push(
        `display_time_after == ${Math.floor(startOfDay.getTime() / 1000) - 1}`,
        `display_time_before == ${Math.floor(startOfNextDay.getTime() / 1000)}`,
      );
    }
    setIsRequesting(true);
    const data = await memoStore.fetchMemos({
      pageSize: DEFAULT_LIST_MEMOS_PAGE_SIZE,
      filter: filters.join(" && "),
      pageToken,
    });

    if (requestSequence !== requestSequenceRef.current) {
      return;
    }

    setIsRequesting(false);
    const fetchedMemoNames = data.memos.map((memo) => memo.name);
    setListedMemoNames((currentMemoNames) =>
      pageToken ? Array.from(new Set([...currentMemoNames, ...fetchedMemoNames])) : fetchedMemoNames,
    );
    nextPageTokenRef.current = data.nextPageToken;
  };

  const handleEditPrevious = useCallback(() => {
    const lastMemo = sortedMemos[sortedMemos.length - 1];
    if (!lastMemo) {
      return;
    }
    showMemoEditorDialog({
      memoName: lastMemo.name,
      cacheKey: `${lastMemo.name}-${lastMemo.displayTime}`,
    });
  }, [sortedMemos]);

  const handleMemoCreated = (memoName: string) => {
    setListedMemoNames((currentMemoNames) => (currentMemoNames.includes(memoName) ? currentMemoNames : [memoName, ...currentMemoNames]));
  };

  return (
    <section className="mindmemo-home-content @container w-full max-w-5xl min-h-[calc(100svh+1px)] flex flex-col justify-start items-center sm:pt-3 md:pt-6 pb-8">
      {!md && (
        <MobileHeader>
          <HomeSidebarDrawer selectedDate={selectedDate} onDateSelect={setSelectedDate} />
        </MobileHeader>
      )}
      <div className={classNames("w-full min-w-0 flex flex-row justify-start items-start px-4 sm:px-6 gap-4")}>
        <div className={classNames("min-w-0", md ? "w-[calc(100%-15rem)]" : "w-full")}>
          <MemoEditor className="mb-2" cacheKey="home-memo-editor" onConfirm={handleMemoCreated} onEditPrevious={handleEditPrevious} />
          <div className="flex flex-col justify-start items-start w-full max-w-full">
            <div className="min-h-9 w-full shrink-0">
              <MemoFilter className="min-h-9 px-2" />
            </div>
            <div className="w-full min-w-0">
              {sortedMemos.map((memo) => (
                <MemoView key={`${memo.name}-${memo.updateTime}`} memo={memo} showPinned />
              ))}
            </div>
            {isRequesting && sortedMemos.length === 0 && listedMemoNames.length === 0 ? (
              <div className="flex flex-row justify-center items-center w-full my-4 text-gray-400">
                <Icon.Loader className="w-4 h-auto animate-spin mr-1" />
                <p className="text-sm italic">{t("memo.fetching-data")}</p>
              </div>
            ) : !isRequesting && !nextPageTokenRef.current ? (
              sortedMemos.length === 0 && (
                <div className="w-full mt-12 mb-8 flex flex-col justify-center items-center italic">
                  <Empty />
                  <p className="mt-2 text-gray-600 dark:text-gray-400">{t("message.no-data")}</p>
                </div>
              )
            ) : nextPageTokenRef.current ? (
              <div className="w-full flex flex-row justify-center items-center my-4">
                <Button variant="plain" endDecorator={<Icon.ArrowDown className="w-5 h-auto" />} onClick={() => fetchMemos()}>
                  {t("memo.fetch-more")}
                </Button>
              </div>
            ) : null}
          </div>
        </div>
        {md && (
          <div className="sticky top-0 left-0 shrink-0 -mt-6 w-56 h-full">
            <HomeSidebar className="py-6" selectedDate={selectedDate} onDateSelect={setSelectedDate} />
          </div>
        )}
      </div>
    </section>
  );
};

export default Home;
