import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { DEFAULT_LOGO_URL, DEFAULT_SERVICE_NAME } from "@/helpers/consts";
import { WorkspaceProfile } from "@/types/proto/api/v2/workspace_service";

interface State {
  locale: Locale;
  appearance: Appearance;
  systemStatus: SystemStatus;
  workspaceProfile: WorkspaceProfile;
}

const globalSlice = createSlice({
  name: "global",
  initialState: {
    locale: "en",
    appearance: "system",
    systemStatus: {
      disablePasswordLogin: false,
      disablePublicMemos: false,
      memoDisplayWithUpdatedTs: false,
      customizedProfile: {
        name: DEFAULT_SERVICE_NAME,
        logoUrl: DEFAULT_LOGO_URL,
        faviconUrl: DEFAULT_LOGO_URL,
        description: "",
        locale: "en",
        appearance: "system",
      },
    },
    workspaceProfile: WorkspaceProfile.fromPartial({}),
  } as State,
  reducers: {
    setGlobalState: (state, action: PayloadAction<Partial<State>>) => {
      return {
        ...state,
        ...action.payload,
      };
    },
    setLocale: (state, action: PayloadAction<Locale>) => {
      return {
        ...state,
        locale: action.payload,
      };
    },
    setAppearance: (state, action: PayloadAction<Appearance>) => {
      return {
        ...state,
        appearance: action.payload,
      };
    },
  },
});

export const { setGlobalState, setLocale, setAppearance } = globalSlice.actions;

export default globalSlice.reducer;
