import { Divider, Dropdown, Menu, MenuButton, MenuItem } from "@mui/joy";
import classNames from "classnames";
import { useState } from "react";
import toast from "react-hot-toast";
import { useLocation } from "react-router-dom";
import Icon from "@/components/Icon";
import useCurrentUser from "@/hooks/useCurrentUser";
import useNavigateTo from "@/hooks/useNavigateTo";
import { extractMemoIdFromName, useMemoStore } from "@/store/v1";
import { RowStatus } from "@/types/proto/api/v2/common";
import { MemoRelation_Type } from "@/types/proto/api/v2/memo_relation_service";
import { Memo } from "@/types/proto/api/v2/memo_service";
import { useTranslate } from "@/utils/i18n";
import { showCommonDialog } from "./Dialog/CommonDialog";
import showMemoEditorDialog from "./MemoEditor/MemoEditorDialog";
import { ReactionPicker } from "./ReactionSelector";
import showShareMemoDialog from "./ShareMemoDialog";

interface Props {
  memo: Memo;
  className?: string;
  hiddenActions?: ("edit" | "archive" | "delete" | "share" | "pin")[];
}

const MemoActionMenu = (props: Props) => {
  const { memo, hiddenActions } = props;
  const t = useTranslate();
  const currentUser = useCurrentUser();
  const location = useLocation();
  const navigateTo = useNavigateTo();
  const memoStore = useMemoStore();
  const [open, setOpen] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const editable = memo.creator === currentUser?.name;
  const isInMemoDetailPage = location.pathname.startsWith(`/m/${memo.uid}`);
  const commentAmount = memo.relations.filter(
    (relation) => relation.type === MemoRelation_Type.COMMENT && relation.relatedMemo === memo.name,
  ).length;

  const handleDropdownOpenChange = (_event: React.SyntheticEvent | null, isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setShowReactionPicker(false);
    }
  };

  const handleShowReactionPicker = (event: React.MouseEvent<HTMLElement>) => {
    (event as React.MouseEvent<HTMLElement> & { defaultMuiPrevented?: boolean }).defaultMuiPrevented = true;
    setShowReactionPicker(true);
  };

  const handleCommentClick = () => {
    setOpen(false);
    navigateTo(`/m/${memo.uid}#comments`);
  };

  const handleTogglePinMemoBtnClick = async () => {
    try {
      if (memo.pinned) {
        await memoStore.updateMemo(
          {
            name: memo.name,
            pinned: false,
          },
          ["pinned"],
        );
      } else {
        await memoStore.updateMemo(
          {
            name: memo.name,
            pinned: true,
          },
          ["pinned"],
        );
      }
    } catch (error) {
      // do nth
    }
  };

  const handleEditMemoClick = () => {
    showMemoEditorDialog({
      memoName: memo.name,
      cacheKey: `${memo.name}-${memo.displayTime}`,
    });
  };

  const handleToggleMemoStatusClick = async () => {
    try {
      if (memo.rowStatus === RowStatus.ARCHIVED) {
        await memoStore.updateMemo(
          {
            name: memo.name,
            rowStatus: RowStatus.ACTIVE,
          },
          ["row_status"],
        );
        toast(t("message.restored-successfully"));
      } else {
        await memoStore.updateMemo(
          {
            name: memo.name,
            rowStatus: RowStatus.ARCHIVED,
          },
          ["row_status"],
        );
        toast.success(t("message.archived-successfully"));
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.response.data.message);
      return;
    }

    if (isInMemoDetailPage) {
      memo.rowStatus === RowStatus.ARCHIVED ? navigateTo("/") : navigateTo("/archived");
    }
  };

  const handleDeleteMemoClick = async () => {
    showCommonDialog({
      title: t("memo.delete-memo"),
      content: t("memo.delete-confirm"),
      style: "danger",
      dialogName: "delete-memo-dialog",
      onConfirm: async () => {
        await memoStore.deleteMemo(memo.name);
        toast.success("Deleted successfully");
        if (isInMemoDetailPage) {
          navigateTo("/");
        }
      },
    });
  };

  return (
    <Dropdown open={open} onOpenChange={handleDropdownOpenChange}>
      <MenuButton slots={{ root: "div" }}>
        <span className={classNames("flex justify-center items-center rounded-full hover:opacity-70", props.className)}>
          <Icon.MoreVertical className="w-4 h-4 mx-auto text-gray-500 dark:text-gray-400" />
        </span>
      </MenuButton>
      <Menu className="text-sm" size="sm" placement="bottom-end">
        {showReactionPicker ? (
          <div className="w-[15rem] px-1 pb-1" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between px-2 pb-1 pt-0.5">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{t("memo.add-reaction")}</span>
              <button
                type="button"
                aria-label={t("common.close")}
                className="rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-zinc-700 dark:hover:text-gray-200"
                onClick={() => {
                  setOpen(false);
                  setShowReactionPicker(false);
                }}
              >
                <Icon.X className="h-4 w-4" />
              </button>
            </div>
            <ReactionPicker
              memo={memo}
              onReactionSelect={() => {
                setOpen(false);
                setShowReactionPicker(false);
              }}
            />
          </div>
        ) : (
          <>
            {editable && !hiddenActions?.includes("pin") && (
              <MenuItem onClick={handleTogglePinMemoBtnClick}>
                {memo.pinned ? <Icon.BookmarkMinus className="w-4 h-auto" /> : <Icon.BookmarkPlus className="w-4 h-auto" />}
                {memo.pinned ? t("common.unpin") : t("common.pin")}
              </MenuItem>
            )}
            {editable && !hiddenActions?.includes("edit") && (
              <MenuItem onClick={handleEditMemoClick}>
                <Icon.Edit3 className="w-4 h-auto" />
                {t("common.edit")}
              </MenuItem>
            )}
            {editable && !hiddenActions?.includes("share") && (
              <MenuItem onClick={() => showShareMemoDialog(extractMemoIdFromName(memo.name))}>
                <Icon.Share className="w-4 h-auto" />
                {t("common.share")}
              </MenuItem>
            )}
            <MenuItem onClick={handleCommentClick}>
              <Icon.MessageCircleMore className="w-4 h-auto" />
              <span>{t("memo.comment.self")}</span>
              {commentAmount > 0 && <span className="ml-auto text-xs text-gray-400 dark:text-gray-500">{commentAmount}</span>}
            </MenuItem>
            <MenuItem onClick={handleShowReactionPicker}>
              <Icon.SmilePlus className="w-4 h-auto" />
              {t("memo.add-reaction")}
            </MenuItem>
            {editable && <Divider />}
            {editable && (
              <MenuItem color="warning" onClick={handleToggleMemoStatusClick}>
                {memo.rowStatus === RowStatus.ARCHIVED ? (
                  <Icon.ArchiveRestore className="w-4 h-auto" />
                ) : (
                  <Icon.Archive className="w-4 h-auto" />
                )}
                {memo.rowStatus === RowStatus.ARCHIVED ? t("common.restore") : t("common.archive")}
              </MenuItem>
            )}
            {editable && (
              <MenuItem color="danger" onClick={handleDeleteMemoClick}>
                <Icon.Trash className="w-4 h-auto" />
                {t("common.delete")}
              </MenuItem>
            )}
          </>
        )}
      </Menu>
    </Dropdown>
  );
};

export default MemoActionMenu;
