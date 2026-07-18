import { Tooltip } from "@mui/joy";
import useCurrentUser from "@/hooks/useCurrentUser";
import { extractMemoIdFromName } from "@/store/v1";
import { Memo, Visibility } from "@/types/proto/api/v2/memo_service";
import { useTranslate } from "@/utils/i18n";
import { convertVisibilityToString } from "@/utils/memo";
import showShareMemoDialog from "./ShareMemoDialog";
import VisibilityIcon from "./VisibilityIcon";

interface Props {
  memo: Memo;
}

const MemoVisibilityButton = ({ memo }: Props) => {
  const t = useTranslate();
  const currentUser = useCurrentUser();

  if (!currentUser) {
    return null;
  }

  const editable = memo.creator === currentUser.name;
  const label = t(`memo.visibility.${convertVisibilityToString(memo.visibility).toLowerCase()}` as any);
  const displayedVisibility = memo.visibility === Visibility.PUBLIC ? Visibility.PUBLIC : Visibility.PRIVATE;

  const icon = <VisibilityIcon visibility={displayedVisibility} />;

  return (
    <Tooltip title={label} placement="top">
      {editable ? (
        <button
          type="button"
          aria-label={label}
          className="flex shrink-0 cursor-pointer items-center justify-center hover:opacity-70"
          onClick={() => showShareMemoDialog(extractMemoIdFromName(memo.name))}
        >
          {icon}
        </button>
      ) : (
        <span role="img" aria-label={label} className="flex shrink-0 items-center justify-center">
          {icon}
        </span>
      )}
    </Tooltip>
  );
};

export default MemoVisibilityButton;
