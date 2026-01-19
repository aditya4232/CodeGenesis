export const VISUAL_EDIT_SCRIPT = `
(function() {
    let active = false;
    let overlay = null;
    let hoveredElement = null;

    function createOverlay() {
        if(overlay) return;
        overlay = document.createElement('div');
        overlay.style.cssText = 'position:fixed;pointer-events:none;z-index:9999;border:2px solid #6366f1;background-color:rgba(99, 102, 241, 0.1);display:none;transition:all 0.1s ease;';
        document.body.appendChild(overlay);
    }

    function handleMouseOver(e) {
        if (!active) return;
        e.stopPropagation();
        hoveredElement = e.target;
        if(hoveredElement === overlay || hoveredElement === document.body || hoveredElement === document.documentElement) return;
        
        if(!overlay) createOverlay();
        const rect = hoveredElement.getBoundingClientRect();
        overlay.style.top = rect.top + 'px';
        overlay.style.left = rect.left + 'px';
        overlay.style.width = rect.width + 'px';
        overlay.style.height = rect.height + 'px';
        overlay.style.display = 'block';
    }

    function handleClick(e) {
        if (!active || !hoveredElement) return;
        e.preventDefault();
        e.stopPropagation();
        
        const styles = window.getComputedStyle(hoveredElement);
        window.parent.postMessage({
            type: 'ELEMENT_SELECTED',
            payload: {
                tagName: hoveredElement.tagName.toLowerCase(),
                text: hoveredElement.innerText.slice(0, 50),
                styles: { color: styles.color, backgroundColor: styles.backgroundColor }
            }
        }, '*');
    }

    window.addEventListener('message', (e) => {
        if (e.data.type === 'TOGGLE_VISUAL_EDIT') {
            active = e.data.enabled;
            if(!active && overlay) overlay.style.display = 'none';
            if(active) createOverlay();
        }
    });

    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('click', handleClick, true);
})();
`;

export const DEFAULT_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CodeGenesis Preview</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            min-height: 100vh;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: system-ui, sans-serif;
            color: white;
        }
        .container { text-align: center; padding: 2rem; max-width: 500px; }
        .icon { font-size: 4rem; margin-bottom: 1.5rem; animation: float 3s ease-in-out infinite; }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        h1 { font-size: 2.5rem; margin-bottom: 1rem; background: linear-gradient(to right, #fff, #a78bfa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        p { color: #94a3b8; line-height: 1.8; font-size: 1.1rem; }
        .badge { display: inline-block; margin-top: 1.5rem; padding: 0.5rem 1rem; background: rgba(255,255,255,0.1); border-radius: 999px; font-size: 0.875rem; color: #a78bfa; }
    </style>
</head>
<body>
    <div class="container">
        <div class="icon">🚀</div>
        <h1>Ready to Build</h1>
        <p>Describe what you want in the chat. I'll generate beautiful, production-ready code for you!</p>
        <span class="badge">Powered by AI</span>
    </div>
</body>
</html>`;
