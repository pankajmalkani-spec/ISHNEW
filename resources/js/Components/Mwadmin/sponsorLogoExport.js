/** Matches legacy PHP sponsor crop output (Sponsor.php CropAvatarLogo). */
export const SPONSOR_LOGO_OUT_W = 196;
export const SPONSOR_LOGO_OUT_H = 160;

export const clampSponsorZoom = (value) => Math.min(3, Math.max(1, Number(value) || 1));

/**
 * Renders rotated/zoomed/panned image into a 196×160 canvas (same as legacy server crop target).
 */
export function exportSponsorLogoFile(file, rotate, zoom, offset, options = {}) {
    return new Promise((resolve) => {
        if (!file) {
            resolve(null);
            return;
        }
        const img = new Image();
        const objectUrl = URL.createObjectURL(file);
        img.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            resolve(file);
        };
        img.onload = () => {
            try {
                const outWidth = SPONSOR_LOGO_OUT_W;
                const outHeight = SPONSOR_LOGO_OUT_H;
                const canvas = document.createElement('canvas');
                canvas.width = outWidth;
                canvas.height = outHeight;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    URL.revokeObjectURL(objectUrl);
                    resolve(file);
                    return;
                }
                const rad = (rotate * Math.PI) / 180;
                const scale = Math.max(outWidth / img.width, outHeight / img.height) * zoom;
                const drawW = img.width * scale;
                const drawH = img.height * scale;
                ctx.clearRect(0, 0, outWidth, outHeight);
                ctx.translate(outWidth / 2, outHeight / 2);
                ctx.rotate(rad);
                ctx.drawImage(img, -drawW / 2 + offset.x, -drawH / 2 + offset.y, drawW, drawH);
                const wantPng = options.format === 'png';
                const mime = wantPng ? 'image/png' : 'image/jpeg';
                const q = (Number(options.quality) || 92) / 100;
                canvas.toBlob(
                    (blob) => {
                        URL.revokeObjectURL(objectUrl);
                        if (!blob) {
                            resolve(file);
                            return;
                        }
                        const ext = wantPng ? 'png' : 'jpg';
                        resolve(new File([blob], `sponsor_logo_${Date.now()}.${ext}`, { type: mime }));
                    },
                    mime,
                    wantPng ? undefined : q
                );
            } catch {
                URL.revokeObjectURL(objectUrl);
                resolve(file);
            }
        };
        img.src = objectUrl;
    });
}
