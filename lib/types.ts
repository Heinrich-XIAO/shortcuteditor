export interface Shortcut {
  isModifiers: {
    isControl: boolean;
    isShift: boolean;
    isAlt: boolean;
    isMeta: boolean;
  };
  key: string;
  uniqueIdentifier: string;
  isRelativeToScrollItem: boolean;
  mustBeVisible: boolean;
}

export interface WebSubURLShortcut {
  uuid: string;
  hrefRegex: string;
  shortcuts: Shortcut[];
  scrollBoxIdentifier: string;
	userId: string;
}

export type ToastType = 'success' | 'error' | 'info';
