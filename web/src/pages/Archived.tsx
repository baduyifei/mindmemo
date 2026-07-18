import { Button } from "@mui/joy";
import { useEffect, useRef, useState } from "react";
import Empty from "@/components/Empty";
import Icon from "@/components/Icon";
import MemoActionMenu from "@/components/MemoActionMenu";
import MemoContent from "@/components/MemoContent";
import showMemoEditorDialog from "@/components/MemoEditor/MemoEditorDialog";
import MemoFilter from "@/components/MemoFilter";
import MemoVisibilityButton from "@/components/MemoVisibilityButton";
import MobileHeader from "@/components/MobileHeader";
import SearchBar from "@/components/SearchBar";
import { DEFAULT_LIST_MEMOS_PAGE_SIZE } from "@/helpers/consts";
import { getTimeStampByDate } from "@/helpers/datetime";
import useCurrentUser from "@/hooks/useCurrentUser";
import useFilterWithUrlParams from "@/hooks/useFilterWithUrlParams";
import { useMemoList, useMemoStore } from "@/store/v1";
import { RowStatus } from "@/types/proto/api/v2/common";
import { Memo } from "@/types/proto/api/v2/memo_service";
import { useTranslate } from "@/utils/i18n";
import { shouldEditMemoOnDoubleClick } from "@/utils/memoDoubleClick";

const Archived = () => {
  const t = useTranslate();
  const user = useCurrentUser();
  const memoStore = useMemoStore();
  const memoList = useMemoList();
  const [isRequesting, setIsRequesting] = useState(true);
  const nextPageTokenRef = useRef<string | undefined>(undefined);
  const { tag: tagQuery, text: textQuery } = useFilterWithUrlParams();
  const sortedMemos = memoList.value
    .filter((memo) => memo.rowStatus === RowStatus.ARCHIVED)
    .sort((a, b) => getTimeStampByDate(b.displayTime) - getTimeStampByDate(a.displayTime));

  useEffect(() => {
    nextPageTokenRef.current = undefined;
    memoList.reset();
    fetchMemos();
  }, [tagQuery, textQuery]);

  const fetchMemos = async () => {
    const filters = [`creator == "${user.name}"`, `row_status == "ARCHIVED"`];
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
    setIsRequesting(true);
    const data = await memoStore.fetchMemos({
      pageSize: DEFAULT_LIST_MEMOS_PAGE_SIZE,
      filter: filters.join(" && "),
      pageToken: nextPageTokenRef.current,
    });
    setIsRequesting(false);
    nextPageTokenRef.current = data.nextPageToken;
  };

  const handleMemoDoubleClick = (event: React.MouseEvent<HTMLDivElement>, memo: Memo) => {
    if (memo.creator !== user.name || !shouldEditMemoOnDoubleClick(event)) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    showMemoEditorDialog({
      memoName: memo.name,
      cacheKey: `${memo.name}-${memo.displayTime}`,
    });
  };

  return (
    <section className="@container w-full max-w-5xl min-h-full flex flex-col justify-start items-center sm:pt-3 md:pt-6 pb-8">
      <MobileHeader />
      <div className="w-full px-4 sm:px-6">
        <div className="w-full flex flex-col justify-start items-start">
          <div className="w-full flex flex-row justify-end items-center mb-2">
            <div className="w-40">
              <SearchBar />
            </div>
          </div>
          <MemoFilter className="px-2 pb-2" />
          {sortedMemos.map((memo) => (
            <div
              key={memo.name}
              className="relative flex flex-col justify-start items-start w-full p-4 pt-3 mb-2 bg-white dark:bg-zinc-800 rounded-lg"
              onDoubleClick={(event) => handleMemoDoubleClick(event, memo)}
            >
              <div className="w-full mb-1 flex flex-row justify-between items-center">
                <div className="w-full max-w-[calc(100%-20px)] flex flex-row justify-start items-center mr-1">
                  <div className="text-sm leading-6 text-gray-400 select-none" data-memo-double-click-ignore>
                    <relative-time datetime={memo.displayTime?.toISOString()} tense="past"></relative-time>
                  </div>
                </div>
                <div className="flex flex-row justify-end items-center gap-x-2" data-memo-double-click-ignore>
                  <MemoVisibilityButton memo={memo} />
                  <MemoActionMenu memo={memo} hiddenActions={["pin", "edit", "share"]} />
                </div>
              </div>
              <MemoContent key={`${memo.name}-${memo.displayTime}`} memoName={memo.name} content={memo.content} readonly={true} />
            </div>
          ))}
          {isRequesting ? (
            <div className="flex flex-row justify-center items-center w-full my-4 text-gray-400">
              <Icon.Loader className="w-4 h-auto animate-spin mr-1" />
              <p className="text-sm italic">{t("memo.fetching-data")}</p>
            </div>
          ) : !nextPageTokenRef.current ? (
            sortedMemos.length === 0 && (
              <div className="w-full mt-16 mb-8 flex flex-col justify-center items-center italic">
                <Empty />
                <p className="mt-4 text-gray-600 dark:text-gray-400">{t("message.no-data")}</p>
              </div>
            )
          ) : (
            <div className="w-full flex flex-row justify-center items-center my-4">
              <Button variant="plain" endDecorator={<Icon.ArrowDown className="w-5 h-auto" />} onClick={fetchMemos}>
                {t("memo.fetch-more")}
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Archived;
