/** Plan values stored in `flowcharttrans.plan` (legacy mwadmin). */
export const PLAN_OPTIONS = [
    { value: '1', label: 'Pre Production' },
    { value: '2', label: 'Production' },
    { value: '3', label: 'Post Production' },
];

export function planLabel(plan) {
    const n = Number(plan);
    if (n === 1) return 'Pre Production';
    if (n === 2) return 'Production';
    if (n === 3) return 'Post Production';
    return plan === null || plan === undefined || plan === '' ? '—' : String(plan);
}
