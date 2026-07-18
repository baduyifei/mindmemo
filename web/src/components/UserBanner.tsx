import classNames from "classnames";
import { DEFAULT_FULL_LOGO_URL } from "@/helpers/consts";
import useCurrentUser from "@/hooks/useCurrentUser";
import useNavigateTo from "@/hooks/useNavigateTo";
import { Routes } from "@/router";
import { useGlobalStore } from "@/store/module";
import { useTranslate } from "@/utils/i18n";
import UserAvatar from "./UserAvatar";

interface Props {
  collapsed?: boolean;
}

const UserBanner = (props: Props) => {
  const { collapsed } = props;
  const t = useTranslate();
  const navigateTo = useNavigateTo();
  const globalStore = useGlobalStore();
  const { systemStatus } = globalStore.state;
  const user = useCurrentUser();
  const title = user ? user.nickname || user.username : systemStatus.customizedProfile.name || "MindMemo";
  const avatarUrl = user ? user.avatarUrl : DEFAULT_FULL_LOGO_URL;

  return (
    <div className="relative w-full h-auto px-1 shrink-0">
      <button
        type="button"
        disabled={!user}
        aria-label={t("common.home")}
        onClick={() => navigateTo(Routes.HOME)}
        className={classNames("block w-full border-0 bg-transparent p-0 text-left", user ? "cursor-pointer" : "cursor-default")}
      >
        <div
          className={classNames(
            "py-1 my-1 w-auto flex flex-row justify-start items-center rounded-2xl border border-transparent text-gray-800 dark:text-gray-400",
            collapsed ? "px-1" : "px-3",
          )}
        >
          <UserAvatar className="shadow shrink-0" avatarUrl={avatarUrl} />
          {!collapsed && <span className="ml-2 text-lg font-medium text-slate-800 dark:text-gray-300 shrink truncate">{title}</span>}
        </div>
      </button>
    </div>
  );
};

export default UserBanner;
