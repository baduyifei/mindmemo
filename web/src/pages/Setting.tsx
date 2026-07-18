import { Option, Select } from "@mui/joy";
import { LucideIcon } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import Icon from "@/components/Icon";
import MobileHeader from "@/components/MobileHeader";
import MemberSection from "@/components/Settings/MemberSection";
import MyAccountSection from "@/components/Settings/MyAccountSection";
import PreferencesSection from "@/components/Settings/PreferencesSection";
import SSOSection from "@/components/Settings/SSOSection";
import SectionMenuItem from "@/components/Settings/SectionMenuItem";
import StorageSection from "@/components/Settings/StorageSection";
import SystemSection from "@/components/Settings/SystemSection";
import { authServiceClient } from "@/grpcweb";
import useCurrentUser from "@/hooks/useCurrentUser";
import useNavigateTo from "@/hooks/useNavigateTo";
import { Routes } from "@/router";
import { useGlobalStore } from "@/store/module";
import { User_Role } from "@/types/proto/api/v2/user_service";
import { useTranslate } from "@/utils/i18n";

type SettingSection = "my-account" | "preference" | "member" | "system" | "storage" | "sso";

interface State {
  selectedSection: SettingSection;
}

const BASIC_SECTIONS: SettingSection[] = ["my-account", "preference"];
const ADMIN_SECTIONS: SettingSection[] = ["member", "system", "storage", "sso"];

const SECTION_ICON_MAP: Record<SettingSection, LucideIcon> = {
  "my-account": Icon.User,
  preference: Icon.Cog,
  member: Icon.Users,
  system: Icon.Settings2,
  storage: Icon.Database,
  sso: Icon.Key,
};

interface SettingsActionItemProps {
  text: string;
  icon: LucideIcon;
  disabled?: boolean;
  onClick: () => void;
}

const SettingsActionItem = ({ text, icon: IconComponent, disabled, onClick }: SettingsActionItemProps) => (
  <button
    type="button"
    disabled={disabled}
    onClick={onClick}
    className="w-full px-3 leading-8 flex flex-row justify-start items-center cursor-pointer rounded-lg select-none transition-colors disabled:cursor-wait disabled:opacity-50 text-gray-600 hover:bg-zinc-100 dark:text-gray-400 dark:hover:bg-zinc-900"
  >
    <IconComponent className="w-4 h-auto mr-2 opacity-80 shrink-0" />
    <span className="truncate">{text}</span>
  </button>
);

const Setting = () => {
  const t = useTranslate();
  const user = useCurrentUser();
  const navigateTo = useNavigateTo();
  const globalStore = useGlobalStore();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [state, setState] = useState<State>({
    selectedSection: "my-account",
  });

  const isHost = user.role === User_Role.HOST;

  const settingsSectionList = useMemo(() => {
    let settingList = [...BASIC_SECTIONS];
    if (isHost) {
      settingList = settingList.concat(ADMIN_SECTIONS);
    }
    return settingList;
  }, [isHost]);

  const handleSectionSelectorItemClick = useCallback((settingSection: SettingSection) => {
    setState({
      selectedSection: settingSection,
    });
  }, []);

  const handleSignOut = useCallback(async () => {
    setIsSigningOut(true);
    try {
      await authServiceClient.signOut({});
      window.location.href = Routes.AUTH;
    } finally {
      setIsSigningOut(false);
    }
  }, []);

  const settingsFooter = (
    <>
      <SettingsActionItem text={t("common.about")} icon={Icon.Smile} onClick={() => navigateTo(Routes.ABOUT)} />
      <SettingsActionItem text={t("common.sign-out")} icon={Icon.LogOut} disabled={isSigningOut} onClick={handleSignOut} />
      {isHost ? (
        <span className="block w-full px-3 mt-2 opacity-70 text-sm">Version: v{globalStore.state.workspaceProfile.version}</span>
      ) : null}
    </>
  );

  return (
    <section className="@container w-full max-w-5xl min-h-full flex flex-col justify-start items-start sm:pt-3 md:pt-6 pb-8">
      <MobileHeader />
      <div className="w-full px-4 sm:px-6">
        <div className="w-full shadow flex flex-row justify-start items-start px-4 py-3 rounded-xl bg-white dark:bg-zinc-800 text-gray-600 dark:text-gray-400">
          <div className="hidden sm:flex flex-col justify-start items-start w-40 h-auto shrink-0 py-2">
            <span className="text-sm mt-0.5 pl-3 font-mono select-none text-gray-400 dark:text-gray-500">{t("common.basic")}</span>
            <div className="w-full flex flex-col justify-start items-start mt-1">
              {BASIC_SECTIONS.map((item) => (
                <SectionMenuItem
                  key={item}
                  text={t(`setting.${item}`)}
                  icon={SECTION_ICON_MAP[item]}
                  isSelected={state.selectedSection === item}
                  onClick={() => handleSectionSelectorItemClick(item)}
                />
              ))}
            </div>
            {isHost ? (
              <>
                <span className="text-sm mt-4 pl-3 font-mono select-none text-gray-400 dark:text-gray-500">{t("common.admin")}</span>
                <div className="w-full flex flex-col justify-start items-start mt-1">
                  {ADMIN_SECTIONS.map((item) => (
                    <SectionMenuItem
                      key={item}
                      text={t(`setting.${item}`)}
                      icon={SECTION_ICON_MAP[item]}
                      isSelected={state.selectedSection === item}
                      onClick={() => handleSectionSelectorItemClick(item)}
                    />
                  ))}
                </div>
              </>
            ) : null}
            <div className="w-full">{settingsFooter}</div>
          </div>
          <div className="w-full grow sm:pl-4 overflow-x-auto">
            <div className="w-auto inline-block my-2 sm:hidden">
              <Select value={state.selectedSection} onChange={(_, value) => handleSectionSelectorItemClick(value as SettingSection)}>
                {settingsSectionList.map((settingSection) => (
                  <Option key={settingSection} value={settingSection}>
                    {t(`setting.${settingSection}`)}
                  </Option>
                ))}
              </Select>
            </div>
            {state.selectedSection === "my-account" ? (
              <MyAccountSection />
            ) : state.selectedSection === "preference" ? (
              <PreferencesSection />
            ) : state.selectedSection === "member" ? (
              <MemberSection />
            ) : state.selectedSection === "system" ? (
              <SystemSection />
            ) : state.selectedSection === "storage" ? (
              <StorageSection />
            ) : state.selectedSection === "sso" ? (
              <SSOSection />
            ) : null}
            <div className="sm:hidden w-full">{settingsFooter}</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Setting;
