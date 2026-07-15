import type { MouseEvent as ReactMouseEvent } from "react";

const MEMO_DOUBLE_CLICK_INTERACTIVE_SELECTOR = [
  "[data-memo-double-click-ignore]",
  "a",
  "button",
  "input",
  "textarea",
  "select",
  "option",
  "label",
  "img",
  "video",
  "audio",
  "iframe",
  "object",
  "embed",
  "[role='button']",
  "[role='link']",
  "[contenteditable='true']",
  ".cursor-pointer",
].join(", ");

type MouseEventWithSourceCapabilities = MouseEvent & {
  sourceCapabilities?: {
    firesTouchEvents?: boolean;
  };
};

export const shouldEditMemoOnDoubleClick = (event: ReactMouseEvent<HTMLElement>) => {
  if (event.button !== 0 || event.detail !== 2) {
    return false;
  }

  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    return false;
  }

  const nativeEvent = event.nativeEvent as MouseEventWithSourceCapabilities;
  if (nativeEvent.sourceCapabilities?.firesTouchEvents) {
    return false;
  }

  const target = event.target;
  if (!(target instanceof Element)) {
    return false;
  }

  return !target.closest(MEMO_DOUBLE_CLICK_INTERACTIVE_SELECTOR);
};
