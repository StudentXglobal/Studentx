// Wannan code ɗin zai duba Idan mutum ya zabi White Mode a dukkan shafuffuka
(function() {
    const savedTheme = localStorage.getItem('studentx-theme') || 'dark';
    applyTheme(savedTheme);
})();

function applyTheme(theme) {
    localStorage.setItem('studentx-theme', theme);
    
    // Cire tsohon style idan akwai
    let oldStyle = document.getElementById('studentx-theme-override');
    if (oldStyle) oldStyle.remove();

    // Idan an zabi Light Mode (White)
    if (theme === 'light') {
        const style = document.createElement('style');
        style.id = 'studentx-theme-override';
        style.innerHTML = `
            /* Tilasta wa dukkan shafuffuka su zama fari */
            body, .header, .bnav, .video-item, .bottom-wrapper, .input-area, .side-drawer, .drawer-overlay, .top-bar, .chat-container, .settings-container {
                background-color: #f0f2f5 !important;
                color: #050505 !important;
                border-color: #e4e6eb !important;
            }
            .bubble, .card, .settings-group, .tool-chip, .upload-popup, .input-area input, .pricing-container, .plan-card, .message.ai .bubble {
                background-color: #ffffff !important;
                color: #050505 !important;
                border-color: #e4e6eb !important;
            }
            input, textarea, select {
                background-color: #ffffff !important;
                color: #050505 !important;
            }
            p, span, h1, h2, h3, h4, h5, h6, a, div {
                color: inherit !important;
            }
        `;
        document.head.appendChild(style);
    }
}
