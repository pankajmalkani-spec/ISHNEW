import './bootstrap';
import '../css/app.css';
import '../css/mwadmin.css';
import '../css/mwadmin.transcript-extras.css';
import '../css/mwadmin-rich-editor-tinymce.css';
/* Quartz + font — AG Grid Quartz theme (see AG Grid themes docs). */
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import 'ag-grid-community/styles/agGridQuartzFont.css';
import './agGridSetup';

import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';
import { ClassicDialogProvider } from './Components/Mwadmin/ClassicDialog';

const pages = import.meta.glob('./Pages/**/*.jsx');

createInertiaApp({
    resolve: (name) => {
        const page = pages[`./Pages/${name}.jsx`];

        if (!page) {
            throw new Error(`Unknown Inertia page: ${name}`);
        }

        return page();
    },
    setup({ el, App, props }) {
        createRoot(el).render(
            <ClassicDialogProvider>
                <App {...props} />
            </ClassicDialogProvider>,
        );
    },
    progress: {
        color: '#4B5563',
    },
});
