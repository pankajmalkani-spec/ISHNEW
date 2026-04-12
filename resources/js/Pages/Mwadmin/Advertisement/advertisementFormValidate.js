/** Inline copy aligned with legacy mwadmin “required” hints */
export const ADVERTISEMENT_REQUIRED_MSG = 'This field is required.';

/**
 * The five required fields (legacy): title, company, contact person, advertise URL, annual rates.
 * @returns {Record<string, string>} field key → message; empty object if valid.
 */
export function validateAdvertisementRequiredFive(form) {
    const errors = {};
    if (!String(form.title ?? '').trim()) {
        errors.title = ADVERTISEMENT_REQUIRED_MSG;
    }
    if (!String(form.company_name ?? '').trim()) {
        errors.company_name = ADVERTISEMENT_REQUIRED_MSG;
    }
    if (!String(form.contactperson_name ?? '').trim()) {
        errors.contactperson_name = ADVERTISEMENT_REQUIRED_MSG;
    }
    const adUrl = String(form.ad_url ?? '').trim();
    if (!adUrl || /^https?:\/\/$/i.test(adUrl)) {
        errors.ad_url = ADVERTISEMENT_REQUIRED_MSG;
    }
    const ar = String(form.annual_rates ?? '').trim();
    if (ar === '') {
        errors.annual_rates = ADVERTISEMENT_REQUIRED_MSG;
    } else if (Number.isNaN(Number(ar))) {
        errors.annual_rates = 'Enter a valid number.';
    }
    return errors;
}

/** Map Laravel 422 `errors` bag to single string per field */
export function laravel422FieldErrors(responseData) {
    const bag = responseData?.errors;
    if (!bag || typeof bag !== 'object') return null;
    const map = {};
    for (const [k, v] of Object.entries(bag)) {
        if (Array.isArray(v) && v[0]) map[k] = v[0];
    }
    return Object.keys(map).length ? map : null;
}
