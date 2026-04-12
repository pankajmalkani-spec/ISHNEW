import { Children, cloneElement, isValidElement } from 'react';
import { mwadminAgGridThemeClass, useMwadminThemeMode } from './MwadminThemeContext';

/**
 * Must be rendered *inside* {@link MwadminLayout} so theme context resolves.
 * Remounts when theme toggles so AG Grid picks up Quartz light/dark CSS variables.
 *
 * AG Grid v33+ defaults to the programmatic `themeQuartz` API, which ignores parent
 * `ag-theme-*` classes. We pass `theme="legacy"` so imported CSS + wrapper classes apply.
 *
 * With React 18+, the grid defaults to `renderingMode: 'default'`. Our listings use inline
 * JSX `cellRenderer` functions in columnDefs; those render reliably with `renderingMode: 'legacy'`.
 */
export default function MwadminThemedAgGrid({ children, style, className = '' }) {
    const themeMode = useMwadminThemeMode();
    const gridClass = `${mwadminAgGridThemeClass(themeMode)} mwadmin-ag-grid ${className}`.trim();

    // Do not use Children.only: newline/indent between wrapper and <AgGridReact> can add
    // text nodes and crash the page with "expected a single React element child".
    const child = Children.toArray(children).find((c) => isValidElement(c));
    const grid = isValidElement(child)
        ? cloneElement(child, {
              theme: child.props.theme ?? 'legacy',
              renderingMode: child.props.renderingMode ?? 'legacy',
              containerStyle: {
                  height: '100%',
                  width: '100%',
                  minHeight: 0,
                  ...(child.props.containerStyle || {}),
              },
          })
        : child;

    const wrapperStyle = {
        width: '100%',
        height: 560,
        minHeight: 420,
        boxSizing: 'border-box',
        ...style,
    };

    return (
        <div key={themeMode} className={gridClass} style={wrapperStyle}>
            {grid}
        </div>
    );
}
