import { Editor } from '@tinymce/tinymce-react';
import { useMemo } from 'react';

/** TinyMCE (self-hosted under /public/tinymce). GPL community build — set licenseKey="gpl". */
export default function NewsArticleRichEditor({ id = 'news-article-rich-editor', value, onChange, disabled = false }) {
    const init = useMemo(
        () => ({
            height: 480,
            menubar: 'file edit view insert format tools table help',
            plugins: [
                'advlist',
                'autolink',
                'lists',
                'link',
                'image',
                'charmap',
                'preview',
                'anchor',
                'searchreplace',
                'visualblocks',
                'code',
                'fullscreen',
                'insertdatetime',
                'media',
                'table',
                'help',
                'wordcount',
                'directionality',
            ],
            toolbar: [
                'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | subscript superscript',
                'forecolor backcolor | alignleft aligncenter alignright alignjustify | bullist numlist | outdent indent',
                'link image media table | charmap hr | code fullscreen | removeformat | help',
            ].join(' | '),
            toolbar_mode: 'wrap',
            branding: false,
            promotion: false,
            resize: true,
            content_style:
                'body { font-family: system-ui, -apple-system, Segoe UI, sans-serif; font-size: 15px; line-height: 1.5; }',
            image_advtab: true,
            table_toolbar:
                'tableprops tabledelete | tableinsertrowbefore tableinsertrowafter tabledeleterow | tableinsertcolbefore tableinsertcolafter tabledeletecol',
        }),
        [],
    );

    return (
        <div className="mwadmin-news-rich-editor">
            <Editor
                licenseKey="gpl"
                id={id}
                tinymceScriptSrc="/tinymce/tinymce.min.js"
                value={value ?? ''}
                disabled={disabled}
                init={init}
                onEditorChange={(html) => onChange(html)}
            />
        </div>
    );
}
