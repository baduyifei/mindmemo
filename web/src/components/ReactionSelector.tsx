import { Dropdown, Menu, MenuButton } from "@mui/joy";
import classNames from "classnames";
import { useRef, useState } from "react";
import useClickAway from "react-use/lib/useClickAway";
import Icon from "@/components/Icon";
import { memoServiceClient } from "@/grpcweb";
import useCurrentUser from "@/hooks/useCurrentUser";
import { useMemoStore } from "@/store/v1";
import { Memo } from "@/types/proto/api/v2/memo_service";
import { Reaction_Type } from "@/types/proto/api/v2/reaction_service";
import { stringifyReactionType } from "./ReactionView";

interface Props {
  memo: Memo;
  className?: string;
}

interface ReactionPickerProps {
  memo: Memo;
  onReactionSelect?: () => void;
}

const REACTION_TYPES = [
  Reaction_Type.THUMBS_UP,
  Reaction_Type.THUMBS_DOWN,
  Reaction_Type.HEART,
  Reaction_Type.FIRE,
  Reaction_Type.CLAPPING_HANDS,
  Reaction_Type.LAUGH,
  Reaction_Type.OK_HAND,
  Reaction_Type.ROCKET,
  Reaction_Type.EYES,
  Reaction_Type.THINKING_FACE,
  Reaction_Type.CLOWN_FACE,
  Reaction_Type.QUESTION_MARK,
];

export const ReactionPicker = ({ memo, onReactionSelect }: ReactionPickerProps) => {
  const currentUser = useCurrentUser();
  const memoStore = useMemoStore();

  const hasReacted = (reactionType: Reaction_Type) => {
    return memo.reactions.some((reaction) => reaction.reactionType === reactionType && reaction.creator === currentUser?.name);
  };

  const handleReactionClick = async (reactionType: Reaction_Type) => {
    if (!currentUser) {
      return;
    }

    try {
      if (hasReacted(reactionType)) {
        const reactions = memo.reactions.filter(
          (reaction) => reaction.reactionType === reactionType && reaction.creator === currentUser.name,
        );
        for (const reaction of reactions) {
          await memoServiceClient.deleteMemoReaction({ reactionId: reaction.id });
        }
      } else {
        await memoServiceClient.upsertMemoReaction({
          name: memo.name,
          reaction: {
            contentId: memo.name,
            reactionType,
          },
        });
      }
      await memoStore.getOrFetchMemoByName(memo.name, { skipCache: true });
    } catch (error) {
      // Keep the selector quiet when a reaction request fails.
    } finally {
      onReactionSelect?.();
    }
  };

  return (
    <div className="grid grid-cols-6 gap-1 px-2 py-1 font-mono">
      {REACTION_TYPES.map((reactionType) => (
        <button
          key={reactionType}
          type="button"
          className={classNames(
            "inline-flex min-h-8 min-w-8 cursor-pointer items-center justify-center rounded-md px-1 text-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-zinc-700 dark:hover:text-gray-200",
            hasReacted(reactionType) && "bg-blue-100 text-blue-700 dark:bg-zinc-700 dark:text-blue-300",
          )}
          onClick={() => handleReactionClick(reactionType)}
        >
          {stringifyReactionType(reactionType)}
        </button>
      ))}
    </div>
  );
};

const ReactionSelector = (props: Props) => {
  const { memo, className } = props;
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useClickAway(containerRef, () => {
    setOpen(false);
  });

  return (
    <Dropdown open={open} onOpenChange={(_, isOpen) => setOpen(isOpen)}>
      <MenuButton slots={{ root: "div" }}>
        <span
          className={classNames(
            "h-7 w-7 flex justify-center items-center rounded-full border dark:border-zinc-700 hover:opacity-70",
            className,
          )}
        >
          <Icon.SmilePlus className="w-4 h-4 mx-auto text-gray-500 dark:text-gray-400" />
        </span>
      </MenuButton>
      <Menu className="relative text-sm" component="div" size="sm" placement="bottom-start">
        <div ref={containerRef}>
          <ReactionPicker memo={memo} onReactionSelect={() => setOpen(false)} />
        </div>
      </Menu>
    </Dropdown>
  );
};

export default ReactionSelector;
