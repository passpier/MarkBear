export type ThemeName =
  | 'github-light'
  | 'dracula'
  | 'nord'
  | 'solarized-dark'
  | 'one-dark-pro'
  | 'tokyo-night'
  | 'gruvbox';

export interface ThemeDefinition {
  name: string;
  displayName: string;
  variant: 'light' | 'dark';
  /**
   * CSS font-family stack for the editor writing surface (body, headings,
   * lists, code). First entry is the theme's bundled monospace family (see
   * src/fonts/fonts.css); the rest is a system-mono fallback.
   */
  font: string;
  colors: {
    // Background colors
    bgPrimary: string;
    bgSecondary: string;
    bgCode: string;
    bgBlockquote: string;
    bgInlineCode: string;
    bgSelection: string;

    // Text colors
    textPrimary: string;
    textHeading: string;
    textMuted: string;

    // Link colors
    linkColor: string;
    linkHover: string;
    linkVisited: string;

    // Border colors
    borderColor: string;
    borderMuted: string;
    borderBlockquote: string;

    // Syntax highlighting
    syntaxKeyword: string;
    syntaxString: string;
    syntaxNumber: string;
    syntaxComment: string;
    syntaxFunction: string;
    syntaxVariable: string;
    syntaxOperator: string;
    syntaxClass: string;
    syntaxTag: string;

    // Special elements
    tableHeaderBg: string;
    tableHeaderText: string;
    tableRowAlt: string;
    checkboxChecked: string;
    checkboxUnchecked: string;
  };
}

export const THEME_NAMES: Record<ThemeName, ThemeDefinition> = {
  // GitHub Light — high-contrast, clean white background
  'github-light': {
    name: 'github-light',
    displayName: 'GitHub Light',
    variant: 'light',
    font: "'JetBrains Mono', ui-monospace, monospace",
    colors: {
      bgPrimary: '#ffffff',
      bgSecondary: '#f6f8fa',
      bgCode: '#f6f8fa',
      bgBlockquote: '#f6f8fa',
      bgInlineCode: '#eaeef2',
      bgSelection: '#fff8c5',
      textPrimary: '#24292f',
      textHeading: '#0550ae',
      textMuted: '#656d76',
      linkColor: '#0969da',
      linkHover: '#0860ca',
      linkVisited: '#6f42c1',
      borderColor: '#d0d7de',
      borderMuted: '#eaeef2',
      borderBlockquote: '#d0d7de',
      syntaxKeyword: '#d1264e',
      syntaxString: '#0a3069',
      syntaxNumber: '#0550ae',
      syntaxComment: '#656d76',
      syntaxFunction: '#8250df',
      syntaxVariable: '#0550ae',
      syntaxOperator: '#24292f',
      syntaxClass: '#8250df',
      syntaxTag: '#0550ae',
      tableHeaderBg: '#f6f8fa',
      tableHeaderText: '#24292f',
      tableRowAlt: '#f6f8fa',
      checkboxChecked: '#1f6feb',
      checkboxUnchecked: '#d0d7de',
    },
  },

  // Dracula — high-contrast, purple/pink accents on deep gray
  'dracula': {
    name: 'dracula',
    displayName: 'Dracula',
    variant: 'dark',
    font: "'Fira Code', ui-monospace, monospace",
    colors: {
      bgPrimary: '#282a36',
      bgSecondary: '#1e1f29',
      bgCode: '#21222c',
      bgBlockquote: '#1e1f29',
      bgInlineCode: '#3f404b',
      bgSelection: '#44475a66',
      textPrimary: '#f8f8f2',
      textHeading: '#8be9fd',
      textMuted: '#6272a4',
      linkColor: '#8be9fd',
      linkHover: '#a4ebf7',
      linkVisited: '#bd93f9',
      borderColor: '#44475a',
      borderMuted: '#3f404b',
      borderBlockquote: '#8be9fd',
      syntaxKeyword: '#ff79c6',
      syntaxString: '#f1fa8c',
      syntaxNumber: '#bd93f9',
      syntaxComment: '#6272a4',
      syntaxFunction: '#8be9fd',
      syntaxVariable: '#8be9fd',
      syntaxOperator: '#ff79c6',
      syntaxClass: '#8be9fd',
      syntaxTag: '#ff79c6',
      tableHeaderBg: '#44475a',
      tableHeaderText: '#f8f8f2',
      tableRowAlt: '#21222c',
      checkboxChecked: '#50fa7b',
      checkboxUnchecked: '#44475a',
    },
  },

  // Nord — low-contrast, cool polar-blue palette
  'nord': {
    name: 'nord',
    displayName: 'Nord',
    variant: 'dark',
    font: "'Cascadia Code', ui-monospace, monospace",
    colors: {
      bgPrimary: '#2e3440',
      bgSecondary: '#3b4252',
      bgCode: '#2e3440',
      bgBlockquote: '#3b4252',
      bgInlineCode: '#434c5e',
      bgSelection: '#434c5e66',
      textPrimary: '#eceff4',
      textHeading: '#88c0d0',
      textMuted: '#81a1c1',
      linkColor: '#81a1c1',
      linkHover: '#88c0d0',
      linkVisited: '#b48ead',
      borderColor: '#434c5e',
      borderMuted: '#3b4252',
      borderBlockquote: '#88c0d0',
      syntaxKeyword: '#81a1c1',
      syntaxString: '#a3be8c',
      syntaxNumber: '#b48ead',
      syntaxComment: '#616e88',
      syntaxFunction: '#88c0d0',
      syntaxVariable: '#8fbcbb',
      syntaxOperator: '#81a1c1',
      syntaxClass: '#8fbcbb',
      syntaxTag: '#81a1c1',
      tableHeaderBg: '#3b4252',
      tableHeaderText: '#eceff4',
      tableRowAlt: '#2e3440',
      checkboxChecked: '#a3be8c',
      checkboxUnchecked: '#434c5e',
    },
  },

  // Solarized Dark — mid/low-contrast, scientifically-derived palette
  'solarized-dark': {
    name: 'solarized-dark',
    displayName: 'Solarized Dark',
    variant: 'dark',
    font: "'Source Code Pro', ui-monospace, monospace",
    colors: {
      bgPrimary: '#002b36',
      bgSecondary: '#073642',
      bgCode: '#002b36',
      bgBlockquote: '#073642',
      bgInlineCode: '#073642',
      bgSelection: '#073642',
      textPrimary: '#839496',
      textHeading: '#268bd2',
      textMuted: '#586e75',
      linkColor: '#268bd2',
      linkHover: '#2aa198',
      linkVisited: '#6c71c4',
      borderColor: '#073642',
      borderMuted: '#073642',
      borderBlockquote: '#2aa198',
      syntaxKeyword: '#859900',
      syntaxString: '#2aa198',
      syntaxNumber: '#d33682',
      syntaxComment: '#586e75',
      syntaxFunction: '#268bd2',
      syntaxVariable: '#268bd2',
      syntaxOperator: '#859900',
      syntaxClass: '#268bd2',
      syntaxTag: '#268bd2',
      tableHeaderBg: '#073642',
      tableHeaderText: '#839496',
      tableRowAlt: '#002b36',
      checkboxChecked: '#859900',
      checkboxUnchecked: '#073642',
    },
  },

  // One Dark Pro — mid/high-contrast, Atom-style dark
  'one-dark-pro': {
    name: 'one-dark-pro',
    displayName: 'One Dark Pro',
    variant: 'dark',
    font: "'Fira Code', ui-monospace, monospace",
    colors: {
      bgPrimary: '#282c34',
      bgSecondary: '#21252b',
      bgCode: '#21252b',
      bgBlockquote: '#21252b',
      bgInlineCode: '#3a3f4b',
      bgSelection: '#3e445166',
      textPrimary: '#abb2bf',
      textHeading: '#61afef',
      textMuted: '#5c6370',
      linkColor: '#61afef',
      linkHover: '#56b6c2',
      linkVisited: '#c678dd',
      borderColor: '#3e4451',
      borderMuted: '#333842',
      borderBlockquote: '#61afef',
      syntaxKeyword: '#c678dd',
      syntaxString: '#98c379',
      syntaxNumber: '#d19a66',
      syntaxComment: '#5c6370',
      syntaxFunction: '#61afef',
      syntaxVariable: '#e06c75',
      syntaxOperator: '#56b6c2',
      syntaxClass: '#e5c07b',
      syntaxTag: '#e06c75',
      tableHeaderBg: '#21252b',
      tableHeaderText: '#abb2bf',
      tableRowAlt: '#2c313c',
      checkboxChecked: '#98c379',
      checkboxUnchecked: '#3e4451',
    },
  },

  // Tokyo Night — cool violet/blue, cyberpunk city-night feel
  'tokyo-night': {
    name: 'tokyo-night',
    displayName: 'Tokyo Night',
    variant: 'dark',
    font: "'JetBrains Mono', ui-monospace, monospace",
    colors: {
      bgPrimary: '#1a1b26',
      bgSecondary: '#16161e',
      bgCode: '#16161e',
      bgBlockquote: '#16161e',
      bgInlineCode: '#24283b',
      bgSelection: '#33467c',
      textPrimary: '#c0caf5',
      textHeading: '#7aa2f7',
      textMuted: '#565f89',
      linkColor: '#7aa2f7',
      linkHover: '#7dcfff',
      linkVisited: '#bb9af7',
      borderColor: '#292e42',
      borderMuted: '#1f2335',
      borderBlockquote: '#7aa2f7',
      syntaxKeyword: '#bb9af7',
      syntaxString: '#9ece6a',
      syntaxNumber: '#ff9e64',
      syntaxComment: '#565f89',
      syntaxFunction: '#7aa2f7',
      syntaxVariable: '#c0caf5',
      syntaxOperator: '#89ddff',
      syntaxClass: '#e0af68',
      syntaxTag: '#f7768e',
      tableHeaderBg: '#1f2335',
      tableHeaderText: '#c0caf5',
      tableRowAlt: '#1f2335',
      checkboxChecked: '#9ece6a',
      checkboxUnchecked: '#292e42',
    },
  },

  // Gruvbox — warm, low-saturation retro palette
  'gruvbox': {
    name: 'gruvbox',
    displayName: 'Gruvbox',
    variant: 'dark',
    font: "'Hack', ui-monospace, monospace",
    colors: {
      bgPrimary: '#282828',
      bgSecondary: '#32302f',
      bgCode: '#32302f',
      bgBlockquote: '#32302f',
      bgInlineCode: '#3c3836',
      bgSelection: '#504945',
      textPrimary: '#ebdbb2',
      textHeading: '#fabd2f',
      textMuted: '#928374',
      linkColor: '#83a598',
      linkHover: '#8ec07c',
      linkVisited: '#d3869b',
      borderColor: '#3c3836',
      borderMuted: '#32302f',
      borderBlockquote: '#fabd2f',
      syntaxKeyword: '#fb4934',
      syntaxString: '#b8bb26',
      syntaxNumber: '#d3869b',
      syntaxComment: '#928374',
      syntaxFunction: '#8ec07c',
      syntaxVariable: '#83a598',
      syntaxOperator: '#fe8019',
      syntaxClass: '#fabd2f',
      syntaxTag: '#fb4934',
      tableHeaderBg: '#3c3836',
      tableHeaderText: '#ebdbb2',
      tableRowAlt: '#32302f',
      checkboxChecked: '#b8bb26',
      checkboxUnchecked: '#3c3836',
    },
  },
};

export const ALL_THEMES = Object.values(THEME_NAMES);
