/** Output sizes for MwadminImageEditorModal — aligned to legacy mwadmin crop exports. */

export const MWADMIN_NEWS_BANNER = { w: 800, h: 526 };
export const MWADMIN_NEWS_COVER = { w: 385, h: 165 };

/** On-page news banner preview — export aspect; max width caps height so the row matches legacy layout. */
export const MWADMIN_NEWS_BANNER_SLOT_STYLE = {
    width: '100%',
    maxWidth: 'min(400px, 100%)',
    aspectRatio: '800 / 526',
    flex: '0 0 auto',
    boxSizing: 'border-box',
    minHeight: 0,
};

/** On-page news cover preview — same aspect as export; fixed max width 385px. */
export const MWADMIN_NEWS_COVER_SLOT_STYLE = {
    width: '100%',
    maxWidth: 'min(385px, 100%)',
    aspectRatio: '385 / 165',
    flex: '0 0 auto',
    boxSizing: 'border-box',
    minHeight: 0,
};

/** Advertisement image — matches legacy mwadmin/Advertisement CropAvatarLogo export. */
export const MWADMIN_AD_IMAGE = { w: 196, h: 160 };

/** On-page ad image preview frame — same px as export; avoids stretched preview from shared row CSS. */
export const MWADMIN_AD_IMAGE_SLOT_STYLE = {
    width: 196,
    maxWidth: 'min(196px, 100%)',
    minHeight: 160,
    maxHeight: 160,
    aspectRatio: '196 / 160',
    flex: '0 0 auto',
    boxSizing: 'border-box',
};
