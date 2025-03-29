// Initialize Avgrund modal
export function initPromotionModal() {
  // Add Avgrund CSS
  const style = document.createElement('style');
  style.textContent = `
    .avgrund-overlay {
      background: rgba(0, 0, 0, 0.5);
      position: fixed;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
      z-index: 100;
      backdrop-filter: blur(2px);
    }
    .avgrund-popup {
      background: white;
      box-sizing: border-box;
      padding: 24px;
      width: 90%;
      max-width: 600px;
      max-height: 90vh;
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 101;
      border-radius: 12px;
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
      overflow-y: auto;
    }
    .avgrund-popup.dark {
      background: #1f2937;
      color: white;
    }
    .avgrund-popup .modal-header {
      margin: -24px -24px 16px -24px;
      padding: 16px 24px;
      border-bottom: 1px solid #e5e7eb;
      position: sticky;
      top: -24px;
      background: inherit;
      border-radius: 12px 12px 0 0;
    }
    .avgrund-popup.dark .modal-header {
      border-bottom-color: #374151;
    }
    .avgrund-popup h3 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
      padding-right: 24px;
    }
    .avgrund-popup .modal-content {
      white-space: pre-wrap;
      line-height: 1.6;
    }
    .avgrund-popup .modal-content p {
      margin: 0 0 16px 0;
    }
    .avgrund-popup .modal-content p:last-child {
      margin-bottom: 0;
    }
    .avgrund-popup .modal-content img {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
      margin: 16px 0;
    }
    .avgrund-popup button.close-button {
      position: absolute;
      top: 12px;
      right: 12px;
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #6b7280;
      padding: 8px;
      line-height: 1;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }
    .avgrund-popup button.close-button:hover {
      background: #f3f4f6;
      color: #374151;
    }
    .avgrund-popup.dark button.close-button {
      color: #9ca3af;
    }
    .avgrund-popup.dark button.close-button:hover {
      background: #374151;
      color: #e5e7eb;
    }
    @media (max-width: 640px) {
      .avgrund-popup {
        width: 100%;
        height: 100%;
        max-height: 100%;
        border-radius: 0;
      }
      .avgrund-popup .modal-header {
        border-radius: 0;
      }
    }
  `;
  document.head.appendChild(style);

  // Add Avgrund JS
  const script = document.createElement('script');
  script.textContent = `
    function Avgrund() {
      const CLOSE_ICON = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';

      const templates = {
        header: (title) => '<div class="modal-header"><h3>' + title + '</h3><button class="close-button" onclick="avgrund.close()" aria-label="Close">' + CLOSE_ICON + '</button></div>',
        
        content: (html) => '<div class="modal-content">' + html + '</div>',
        
        paragraph: (text) => '<p>' + text + '</p>',
        
        formatContent: (content) => {
          return content
            .split('\\n\\n')
            .filter(p => p.trim())
            .map(p => templates.paragraph(p.trim().replace(/\\n/g, '<br>')))
            .join('');
        }
      };

      const overlay = document.createElement('div');
      overlay.className = 'avgrund-overlay';
      
      const popup = document.createElement('div');
      popup.className = 'avgrund-popup';
      if (document.documentElement.classList.contains('dark')) {
        popup.classList.add('dark');
      }
      
      this.open = function(title, content) {
        popup.innerHTML = templates.header(title) + templates.content(templates.formatContent(content));
        document.body.appendChild(overlay);
        document.body.appendChild(popup);
        document.body.style.overflow = 'hidden';
        
        const handleEscape = (e) => {
          if (e.key === 'Escape') this.close();
        };
        document.addEventListener('keydown', handleEscape);
        
        overlay.addEventListener('click', (e) => {
          if (e.target === overlay) this.close();
        });
      };
      
      this.close = function() {
        document.body.removeChild(overlay);
        document.body.removeChild(popup);
        document.body.style.overflow = '';
      };
    }
    
    var avgrund = new Avgrund();
    
    window.showPromotionModal = function(title, description) {
      avgrund.open(title, description);
    };
  `;
  document.head.appendChild(script);
}

// Show promotion modal
export function showPromotionModal(title, description) {
  if (typeof avgrund !== 'undefined') {
    avgrund.open(title, description);
  }
} 