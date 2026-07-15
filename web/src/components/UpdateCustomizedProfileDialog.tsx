import { Button, IconButton, Input } from "@mui/joy";
import Textarea from "@mui/joy/Textarea/Textarea";
import { useRef, useState } from "react";
import { toast } from "react-hot-toast";
import * as api from "@/helpers/api";
import { DEFAULT_LOGO_URL, DEFAULT_SERVICE_NAME } from "@/helpers/consts";
import { createCircularFavicon } from "@/helpers/favicon";
import { useGlobalStore } from "@/store/module";
import { useTranslate } from "@/utils/i18n";
import AppearanceSelect from "./AppearanceSelect";
import { generateDialog } from "./Dialog";
import Icon from "./Icon";
import LocaleSelect from "./LocaleSelect";

type Props = DialogProps;

const UpdateCustomizedProfileDialog: React.FC<Props> = ({ destroy }: Props) => {
  const t = useTranslate();
  const globalStore = useGlobalStore();
  const [state, setState] = useState<CustomizedProfile>(globalStore.state.systemStatus.customizedProfile);
  const [isProcessingFavicon, setIsProcessingFavicon] = useState(false);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  const handleCloseButtonClick = () => {
    destroy();
  };

  const setPartialState = (partialState: Partial<CustomizedProfile>) => {
    setState((state) => {
      return {
        ...state,
        ...partialState,
      };
    });
  };

  const handleNameChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPartialState({
      name: e.target.value as string,
    });
  };

  const handleLogoUrlChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPartialState({
      logoUrl: e.target.value as string,
    });
  };

  const handleDescriptionChanged = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPartialState({
      description: e.target.value as string,
    });
  };

  const handleFaviconFileChanged = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setIsProcessingFavicon(true);
    try {
      const faviconUrl = await createCircularFavicon(file);
      setPartialState({ faviconUrl });
    } catch (error) {
      const errorCode = error instanceof Error ? error.message : "invalid-image";
      if (errorCode === "unsupported-file-type") {
        toast.error(t("setting.system-section.customize-server.favicon-type-error"));
      } else if (errorCode === "file-too-large") {
        toast.error(t("setting.system-section.customize-server.favicon-size-error"));
      } else {
        toast.error(t("setting.system-section.customize-server.favicon-invalid-error"));
      }
    } finally {
      setIsProcessingFavicon(false);
      event.target.value = "";
    }
  };

  const handleLocaleSelectChange = (locale: Locale) => {
    setPartialState({
      locale: locale,
    });
  };

  const handleAppearanceSelectChange = (appearance: Appearance) => {
    setPartialState({
      appearance: appearance,
    });
  };

  const handleRestoreButtonClick = () => {
    setPartialState({
      name: DEFAULT_SERVICE_NAME,
      logoUrl: DEFAULT_LOGO_URL,
      faviconUrl: DEFAULT_LOGO_URL,
      description: "",
      locale: "en",
      appearance: "system",
    });
  };

  const handleSaveButtonClick = async () => {
    if (state.name === "") {
      toast.error(t("message.fill-server-name"));
      return;
    }

    try {
      await api.upsertSystemSetting({
        name: "customized-profile",
        value: JSON.stringify(state),
      });
      await globalStore.fetchSystemStatus();
    } catch (error) {
      console.error(error);
      return;
    }
    toast.success(t("message.succeed-update-customized-profile"));
    destroy();
  };

  return (
    <>
      <div className="dialog-header-container">
        <p className="title-text">{t("setting.system-section.customize-server.title")}</p>
        <IconButton size="sm" onClick={handleCloseButtonClick}>
          <Icon.X className="w-5 h-auto" />
        </IconButton>
      </div>
      <div className="dialog-content-container min-w-[16rem]">
        <p className="text-sm mb-1">{t("setting.system-section.server-name")}</p>
        <Input className="w-full" type="text" value={state.name} onChange={handleNameChanged} />
        <p className="text-sm mb-1 mt-2">{t("setting.system-section.customize-server.icon-url")}</p>
        <Input className="w-full" type="text" value={state.logoUrl} onChange={handleLogoUrlChanged} />
        <p className="text-sm mb-1 mt-3">{t("setting.system-section.customize-server.favicon")}</p>
        <div className="w-full rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50/80 dark:bg-zinc-800/70 p-3 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="w-16 h-16 shrink-0 rounded-full border border-gray-200 dark:border-zinc-600 bg-white dark:bg-zinc-900 shadow-sm flex items-center justify-center overflow-hidden">
            <img
              className="w-full h-full object-contain rounded-full"
              src={state.faviconUrl || state.logoUrl || DEFAULT_LOGO_URL}
              alt={t("setting.system-section.customize-server.favicon-preview")}
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs leading-5 text-gray-500 dark:text-gray-400">
              {t("setting.system-section.customize-server.favicon-hint")}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <input
                ref={faviconInputRef}
                className="hidden"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleFaviconFileChanged}
              />
              <Button
                size="sm"
                variant="outlined"
                loading={isProcessingFavicon}
                startDecorator={<Icon.Upload className="w-4 h-4" />}
                onClick={() => faviconInputRef.current?.click()}
              >
                {t("setting.system-section.customize-server.upload-favicon")}
              </Button>
              <Button
                size="sm"
                variant="plain"
                color="neutral"
                disabled={!state.faviconUrl}
                startDecorator={<Icon.Trash2 className="w-4 h-4" />}
                onClick={() => setPartialState({ faviconUrl: "" })}
              >
                {t("setting.system-section.customize-server.remove-favicon")}
              </Button>
            </div>
          </div>
        </div>
        <p className="text-sm mb-1 mt-2">{t("setting.system-section.customize-server.description")}</p>
        <Textarea className="w-full" minRows="2" maxRows="4" value={state.description} onChange={handleDescriptionChanged} />
        <p className="text-sm mb-1 mt-2">{t("setting.system-section.customize-server.locale")}</p>
        <LocaleSelect className="!w-full" value={state.locale} onChange={handleLocaleSelectChange} />
        <p className="text-sm mb-1 mt-2">{t("setting.system-section.customize-server.appearance")}</p>
        <AppearanceSelect className="!w-full" value={state.appearance} onChange={handleAppearanceSelectChange} />
        <div className="mt-4 w-full flex flex-row justify-between items-center space-x-2">
          <div className="flex flex-row justify-start items-center">
            <Button variant="outlined" onClick={handleRestoreButtonClick}>
              {t("common.restore")}
            </Button>
          </div>
          <div className="flex flex-row justify-end items-center">
            <Button variant="plain" onClick={handleCloseButtonClick}>
              {t("common.cancel")}
            </Button>
            <Button onClick={handleSaveButtonClick}>{t("common.save")}</Button>
          </div>
        </div>
      </div>
    </>
  );
};

function showUpdateCustomizedProfileDialog() {
  generateDialog(
    {
      className: "update-customized-profile-dialog",
      dialogName: "update-customized-profile-dialog",
    },
    UpdateCustomizedProfileDialog,
  );
}

export default showUpdateCustomizedProfileDialog;
