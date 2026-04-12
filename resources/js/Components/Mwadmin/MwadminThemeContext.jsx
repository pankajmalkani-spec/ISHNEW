import { createContext, useContext } from 'react';

export const MwadminThemeContext = createContext({ themeMode: 'light' });

export function useMwadminThemeMode() {
    return useContext(MwadminThemeContext).themeMode;
}

/** AG Grid Quartz: light or dark class to match mwadmin shell theme */
export function mwadminAgGridThemeClass(themeMode) {
    return themeMode === 'dark' ? 'ag-theme-quartz-dark' : 'ag-theme-quartz';
}
