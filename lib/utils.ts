import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { v4 as uuidv4 } from 'uuid';
import JSON5 from 'json5';
import { WebSubURLShortcut } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateUUID(): string {
  return uuidv4();
}

export function formatJSON5(data: any): string {
  return JSON5.stringify(data, null, 2);
}

export function parseJSON5(text: string): any {
  try {
    return JSON5.parse(text);
  } catch (error) {
    throw new Error('Invalid JSON5 format');
  }
}

export function getDefaultShortcut(): WebSubURLShortcut {
  return {
    uuid: generateUUID(),
    hrefRegex: "",
    shortcuts: [
      {
        isModifiers: {
          isControl: false,
          isShift: false,
          isAlt: false,
          isMeta: false,
        },
        key: "",
        uniqueIdentifier: "",
        isRelativeToScrollItem: false,
      },
    ],
    scrollBoxIdentifier: "",
  };
}

export function formatShortcutKey(shortcut: {
  isModifiers: {
    isControl: boolean;
    isShift: boolean;
    isAlt: boolean;
    isMeta: boolean;
  };
  key: string;
}): string {
  const modifiers = [];
  
  if (shortcut.isModifiers.isControl) modifiers.push('Ctrl');
  if (shortcut.isModifiers.isShift) modifiers.push('Shift');
  if (shortcut.isModifiers.isAlt) modifiers.push('Alt');
  if (shortcut.isModifiers.isMeta) modifiers.push('Meta');
  
  const keyDisplay = shortcut.key.toUpperCase();
  
  return [...modifiers, keyDisplay].join(' + ');
}