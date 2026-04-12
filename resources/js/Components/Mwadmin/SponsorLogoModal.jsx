import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { clampSponsorZoom, exportSponsorLogoFile, SPONSOR_LOGO_OUT_H, SPONSOR_LOGO_OUT_W } from './sponsorLogoExport';

const rotateOptions = [-15, -30, -45, 15, 30, 45];

function SponsorPreviewThumb({ preview, showOriginal, originalPreview, rotate, zoom, offset, width, label }) {
    const h = (width * SPONSOR_LOGO_OUT_H) / SPONSOR_LOGO_OUT_W;
    const src = showOriginal && originalPreview ? originalPreview : preview;
    return (
        <div
            style={{
                width,
                height: h,
                border: '1px solid #d3c2ab',
                overflow: 'hidden',
                background: '#fbf7f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
            title={label}
        >
            {src ? (
                <img
                    src={src}
                    alt=""
                    style={{
                        transform: `translate(${offset.x * 0.35}px, ${offset.y * 0.35}px) rotate(${rotate}deg) scale(${zoom})`,
                        maxWidth: 'none',
                        maxHeight: 'none',
                        pointerEvents: 'none',
                    }}
                    className="mwadmin-crop-image"
                />
            ) : (
                <span style={{ fontSize: 9, color: '#8a7a68', textAlign: 'center', padding: 4, lineHeight: 1.3 }}>
                    {SPONSOR_LOGO_OUT_W}px × {SPONSOR_LOGO_OUT_H}px
                    <br />
                    SPONSOR LOGO
                </span>
            )}
        </div>
    );
}

/**
 * Full-screen style modal: upload, pan/zoom/rotate, export 196×160 (legacy parity).
 */
export default function SponsorLogoModal({ open, onClose, onApply, existingImageUrl = null, dialog }) {
    const fileRef = useRef(null);
    const dragRef = useRef(null);
    const [workFile, setWorkFile] = useState(null);
    const [displayUrl, setDisplayUrl] = useState('');
    const [originalUrl, setOriginalUrl] = useState('');
    const [rotate, setRotate] = useState(0);
    const [zoom, setZoom] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [opts, setOpts] = useState({ format: 'jpg', quality: 92, showOriginal: false });
    const [dragging, setDragging] = useState(false);
    const [loadingUrl, setLoadingUrl] = useState(false);

    const resetTransforms = useCallback(() => {
        setRotate(0);
        setZoom(1);
        setOffset({ x: 0, y: 0 });
    }, []);

    const revokeDisplay = useCallback((url) => {
        if (url && url.startsWith('blob:')) URL.revokeObjectURL(url);
    }, []);

    useEffect(() => {
        if (!open) return;

        let cancelled = false;
        const run = async () => {
            setWorkFile(null);
            revokeDisplay(displayUrl);
            revokeDisplay(originalUrl);
            setDisplayUrl('');
            setOriginalUrl('');
            resetTransforms();

            if (existingImageUrl) {
                setLoadingUrl(true);
                try {
                    const res = await fetch(existingImageUrl, { credentials: 'same-origin' });
                    const blob = await res.blob();
                    if (cancelled) return;
                    const file = new File([blob], 'sponsor_logo.jpg', { type: blob.type || 'image/jpeg' });
                    setWorkFile(file);
                    const u = URL.createObjectURL(file);
                    setDisplayUrl(u);
                    setOriginalUrl(u);
                } catch {
                    if (!cancelled) dialog?.toast?.('Could not load existing logo.', 'error');
                } finally {
                    if (!cancelled) setLoadingUrl(false);
                }
            }
        };
        run();
        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-run when modal opens or URL changes
    }, [open, existingImageUrl]);

    useEffect(() => {
        return () => {
            revokeDisplay(displayUrl);
            revokeDisplay(originalUrl);
        };
    }, [displayUrl, originalUrl, revokeDisplay]);

    const getPoint = (e) =>
        e.touches && e.touches[0]
            ? { x: e.touches[0].clientX, y: e.touches[0].clientY }
            : { x: e.clientX, y: e.clientY };

    const startDrag = (e) => {
        if (e.cancelable) e.preventDefault();
        const point = getPoint(e);
        dragRef.current = { startX: point.x, startY: point.y, baseX: offset.x, baseY: offset.y };
        setDragging(true);
    };

    const moveDrag = (e) => {
        const d = dragRef.current;
        if (!d) return;
        if (e.cancelable) e.preventDefault();
        const point = getPoint(e);
        setOffset({
            x: d.baseX + (point.x - d.startX),
            y: d.baseY + (point.y - d.startY),
        });
    };

    const endDrag = () => {
        dragRef.current = null;
        setDragging(false);
    };

    useEffect(() => {
        const onMove = (e) => moveDrag(e);
        const onUp = () => endDrag();
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
        window.addEventListener('touchmove', onMove, { passive: false });
        window.addEventListener('touchend', onUp);
        return () => {
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
            window.removeEventListener('touchmove', onMove);
            window.removeEventListener('touchend', onUp);
        };
    }, []);

    const onPickFile = (e) => {
        const file = e.target.files?.[0] || null;
        e.target.value = '';
        if (!file) return;
        revokeDisplay(displayUrl);
        revokeDisplay(originalUrl);
        setWorkFile(file);
        const u = URL.createObjectURL(file);
        setDisplayUrl(u);
        setOriginalUrl(u);
        resetTransforms();
    };

    const handleDone = async () => {
        if (!workFile) {
            dialog?.toast?.('Choose an image first.', 'error');
            return;
        }
        const out = await exportSponsorLogoFile(workFile, rotate, zoom, offset, {
            format: opts.format,
            quality: opts.quality,
        });
        if (!out) {
            dialog?.toast?.('Could not process image.', 'error');
            return;
        }
        onApply(out);
        onClose();
    };

    if (!open) return null;

    const previewSrc = opts.showOriginal ? originalUrl || displayUrl : displayUrl;

    const node = (
        <div
            className="mwadmin-modal-backdrop"
            role="presentation"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div
                className="mwadmin-modal-card mwadmin-modal-card--wide sponsor-logo-modal-card"
                role="dialog"
                aria-modal="true"
                aria-labelledby="sponsor-logo-modal-title"
                onMouseDown={(e) => e.stopPropagation()}
            >
                <div className="sponsor-logo-modal-head">
                    <h3 id="sponsor-logo-modal-title">Sponsor Logo</h3>
                    <button type="button" className="sponsor-logo-modal-close" onClick={onClose} aria-label="Close">
                        ×
                    </button>
                </div>
                <p className="sponsor-logo-modal-hint">
                    Image output size: {SPONSOR_LOGO_OUT_W}px × {SPONSOR_LOGO_OUT_H}px — drag to position, zoom and rotate
                    as needed.
                </p>
                <div className="sponsor-logo-local-row">
                    <span className="sponsor-logo-local-label">Local upload</span>
                    <input ref={fileRef} type="file" accept="image/*" className="mwadmin-hidden-input" onChange={onPickFile} />
                    <button type="button" className="mwadmin-upload-btn" onClick={() => fileRef.current?.click()}>
                        Choose File
                    </button>
                    {loadingUrl ? <span className="sponsor-logo-loading">Loading…</span> : null}
                </div>

                <div className="sponsor-logo-editor-body">
                    <div className="mwadmin-crop-shell sponsor-logo-crop-shell">
                        <div
                            className={`mwadmin-crop-main sponsor-logo-crop-main ${dragging ? 'dragging' : ''}`}
                            onMouseDown={startDrag}
                            onTouchStart={startDrag}
                            onWheel={(e) => {
                                e.preventDefault();
                                setZoom((z) => clampSponsorZoom(z + (e.deltaY > 0 ? -0.1 : 0.1)));
                            }}
                            tabIndex={0}
                        >
                            {previewSrc ? (
                                <img
                                    src={previewSrc}
                                    alt="Logo preview"
                                    style={{
                                        transform: `translate(${offset.x}px, ${offset.y}px) rotate(${rotate}deg) scale(${zoom})`,
                                    }}
                                    className="mwadmin-crop-image mwadmin-crop-main-image"
                                />
                            ) : (
                                <div className="sponsor-logo-placeholder">
                                    <span>196 × 160</span>
                                    <small>Choose a file to preview</small>
                                </div>
                            )}
                        </div>
                        <div className="mwadmin-crop-right sponsor-logo-previews">
                            <SponsorPreviewThumb
                                preview={displayUrl}
                                showOriginal={opts.showOriginal}
                                originalPreview={originalUrl}
                                rotate={rotate}
                                zoom={zoom}
                                offset={offset}
                                width={120}
                                label="Large preview"
                            />
                            <SponsorPreviewThumb
                                preview={displayUrl}
                                showOriginal={opts.showOriginal}
                                originalPreview={originalUrl}
                                rotate={rotate}
                                zoom={zoom}
                                offset={offset}
                                width={90}
                                label="Medium preview"
                            />
                            <SponsorPreviewThumb
                                preview={displayUrl}
                                showOriginal={opts.showOriginal}
                                originalPreview={originalUrl}
                                rotate={rotate}
                                zoom={zoom}
                                offset={offset}
                                width={54}
                                label="Small preview"
                            />
                        </div>
                    </div>
                </div>

                <div className="mwadmin-zoom-row">
                    <label>Zoom</label>
                    <input
                        type="range"
                        min="1"
                        max="3"
                        step="0.1"
                        value={zoom}
                        onChange={(e) => setZoom(clampSponsorZoom(e.target.value))}
                    />
                    <span>{zoom.toFixed(1)}x</span>
                </div>
                <div className="mwadmin-advanced-row">
                    <select value={opts.format} onChange={(e) => setOpts((o) => ({ ...o, format: e.target.value }))}>
                        <option value="jpg">JPG</option>
                        <option value="png">PNG</option>
                    </select>
                    <input
                        type="number"
                        min="40"
                        max="100"
                        value={opts.quality}
                        onChange={(e) => setOpts((o) => ({ ...o, quality: Number(e.target.value) }))}
                    />
                    <label>
                        <input
                            type="checkbox"
                            checked={opts.showOriginal}
                            onChange={(e) => setOpts((o) => ({ ...o, showOriginal: e.target.checked }))}
                        />{' '}
                        Before
                    </label>
                </div>
                <div className="mwadmin-rotate-row sponsor-logo-rotate-row">
                    <button type="button" onClick={() => setRotate((d) => d - 90)}>
                        Rotate Left
                    </button>
                    {rotateOptions.slice(0, 3).map((deg) => (
                        <button key={`sl${deg}`} type="button" onClick={() => setRotate((d) => d + deg)}>
                            {deg}deg
                        </button>
                    ))}
                    <button type="button" onClick={() => setRotate((d) => d + 90)}>
                        Rotate Right
                    </button>
                    {rotateOptions.slice(3).map((deg) => (
                        <button key={`sr${deg}`} type="button" onClick={() => setRotate((d) => d + deg)}>
                            {deg}deg
                        </button>
                    ))}
                    <button type="button" onClick={resetTransforms}>
                        Reset
                    </button>
                </div>

                <div className="mwadmin-modal-actions sponsor-logo-modal-actions">
                    <button type="button" className="mwadmin-modal-btn ghost" onClick={onClose}>
                        Cancel
                    </button>
                    <button type="button" className="mwadmin-modal-btn" onClick={handleDone}>
                        Done
                    </button>
                </div>
            </div>
        </div>
    );

    if (typeof document === 'undefined') return node;
    return createPortal(node, document.body);
}
