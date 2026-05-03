import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function YoutubeHoverPreview({ youtubeUrl, coverSrc, fallbackImg }) {
    const [isHovered, setIsHovered] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0 });
    const imgRef = useRef(null);

    const getYoutubeEmbedUrl = (url) => {
        if (!url) return null;
        const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{6,})/);
        return m ? `https://www.youtube.com/embed/${m[1]}?autoplay=1&mute=1` : null;
    };

    const embedUrl = getYoutubeEmbedUrl(youtubeUrl);

    useEffect(() => {
        if (isHovered && imgRef.current) {
            const rect = imgRef.current.getBoundingClientRect();
            // Try to show to the right of the image, or left if not enough space
            let left = rect.right + 10;
            if (left + 320 > window.innerWidth) {
                left = rect.left - 330;
            }
            
            let top = rect.top - 50;
            if (top + 180 > window.innerHeight) {
                top = window.innerHeight - 190;
            }
            
            setCoords({ top, left });
        }
    }, [isHovered]);

    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => setIsHovered(false);

    return (
        <span 
            className="mwadmin-newslisting-cover-cell" 
            onMouseEnter={handleMouseEnter} 
            onMouseLeave={handleMouseLeave}
        >
            <span className="mwadmin-newslisting-cover-frame" ref={imgRef}>
                <img 
                    className="mwadmin-newslisting-cover-thumb" 
                    src={coverSrc} 
                    alt="" 
                    onError={(e) => {
                        const el = e.currentTarget;
                        if (el.getAttribute('data-fallback') === '1') return;
                        el.setAttribute('data-fallback', '1');
                        el.onerror = null;
                        el.src = fallbackImg || '/images/categoryImages/boxImages/no_img.gif';
                    }}
                    style={{ maxWidth: '120px', maxHeight: '72px', objectFit: 'cover' }}
                />
            </span>
            {isHovered && embedUrl && typeof document !== 'undefined' && createPortal(
                <div style={{
                    position: 'fixed',
                    top: coords.top,
                    left: coords.left,
                    zIndex: 99999,
                    backgroundColor: '#000',
                    borderRadius: '8px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                    overflow: 'hidden',
                    width: '320px',
                    height: '180px',
                    pointerEvents: 'none'
                }}>
                    <iframe 
                        width="320" 
                        height="180" 
                        src={embedUrl} 
                        title="YouTube preview" 
                        frameBorder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen
                    ></iframe>
                </div>,
                document.body
            )}
        </span>
    );
}
