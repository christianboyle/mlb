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
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .avgrund-popup.dark .modal-header {
      border-bottom-color: #374151;
    }
    .avgrund-popup h3 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
      line-height: 1.2;
    }
    .avgrund-popup .modal-content {
      white-space: pre-wrap;
      line-height: 1.6;
    }
    .avgrund-popup .promotion {
      margin-bottom: 24px;
      padding-bottom: 24px;
      border-bottom: 1px solid #e5e7eb;
    }
    .avgrund-popup.dark .promotion {
      border-bottom-color: #374151;
    }
    .avgrund-popup .promotion:last-child {
      margin-bottom: 0;
      padding-bottom: 0;
      border-bottom: none;
    }
    .avgrund-popup .promotion-type {
      font-weight: 600;
      margin-bottom: 8px;
      color: #111827;
    }
    .avgrund-popup.dark .promotion-type {
      color: #f3f4f6;
    }
    .avgrund-popup .promotion-description {
      margin: 0 0 16px 0;
      color: #4b5563;
    }
    .avgrund-popup.dark .promotion-description {
      color: #9ca3af;
    }
    .avgrund-popup .promotion-image {
      margin: 16px 0;
      border-radius: 8px;
      overflow: hidden;
    }
    .avgrund-popup .promotion-image img {
      width: 100%;
      height: auto;
      display: block;
    }
    .avgrund-popup .promotion-link {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      color: #3b82f6;
      text-decoration: none;
      font-size: 0.875rem;
      font-weight: 500;
      transition: all 0.2s;
      padding: 8px 12px;
      background: #f3f4f6;
      border-radius: 6px;
    }
    .avgrund-popup.dark .promotion-link {
      color: #60a5fa;
      background: #374151;
    }
    .avgrund-popup .promotion-link:hover {
      text-decoration: underline;
      opacity: 0.9;
      background: #e5e7eb;
    }
    .avgrund-popup.dark .promotion-link:hover {
      background: #4b5563;
    }
    .avgrund-popup .modal-footer {
      margin: 16px -24px -24px -24px;
      padding: 16px 24px;
      border-top: 1px solid #e5e7eb;
      background: inherit;
      border-radius: 0 0 12px 12px;
    }
    .avgrund-popup.dark .modal-footer {
      border-top-color: #374151;
    }
    .avgrund-popup .modal-footer a {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      color: #6b7280;
      text-decoration: none;
      font-size: 0.875rem;
      font-weight: 500;
      transition: all 0.2s;
    }
    .avgrund-popup.dark .modal-footer a {
      color: #9ca3af;
    }
    .avgrund-popup .modal-footer a:hover {
      text-decoration: underline;
      opacity: 0.9;
    }
    .avgrund-popup button.close-button {
      background: none;
      border: none;
      cursor: pointer;
      color: #6b7280;
      padding: 6px;
      width: 24px;
      height: 24px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
      margin-left: 8px;
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
      .avgrund-popup .modal-header,
      .avgrund-popup .modal-footer {
        border-radius: 0;
      }
    }
  `;
  document.head.appendChild(style);

  // Add Avgrund JS
  const script = document.createElement('script');
  script.textContent = `
    function Avgrund() {
      const CLOSE_ICON = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
      const EXTERNAL_LINK_ICON = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>';
      const CALENDAR_ICON = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>';

      const templates = {
        header: (title) => '<div class="modal-header"><h3>' + title + '</h3><button class="close-button" onclick="avgrund.close()" aria-label="Close">' + CLOSE_ICON + '</button></div>',
        
        promotion: (p) => {
          const imageHtml = p.image_url 
            ? '<div class="mt-4 mb-6"><img src="' + p.image_url + '" alt="' + p.type + '" class="rounded-lg shadow-lg"></div>'
            : '';

          const linkHtml = p.url
            ? '<div class="mt-4"><a href="' + p.url + '" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"><span>More Information</span><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-external-link"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg></a></div>'
            : '';

          const nameHtml = p.name
            ? '<div class="text-gray-700 dark:text-gray-300 mt-2">' + p.name + '</div>'
            : '';

          const distributionHtml = p.distribution
            ? '<div class="text-sm text-gray-600 dark:text-gray-400 mt-1">' + p.distribution + '</div>'
            : '';

          const presenterHtml = p.presenter
            ? '<div class="text-sm text-gray-500 dark:text-gray-500 mt-1">Presented by ' + p.presenter + '</div>'
            : '';

          const descriptionHtml = p.description
            ? '<div class="mt-2 text-gray-700 dark:text-gray-300">' + p.description + '</div>'
            : '';

          return '<div class="promotion mb-8 last:mb-0">' +
            '<h3 class="text-lg font-semibold text-gray-900 dark:text-white">' + p.type + '</h3>' +
            nameHtml +
            distributionHtml +
            presenterHtml +
            descriptionHtml +
            imageHtml +
            linkHtml +
            '</div>';
        },
        
        content: (promotions) => '<div class="modal-content">' + 
          promotions.map(p => templates.promotion(p)).join('') +
          '</div>',
        
        footer: () => '<div class="modal-footer">' +
          '<a href="https://www.mlb.com/royals/tickets/promotions" target="_blank" rel="noopener noreferrer">' + CALENDAR_ICON + ' View All Promotions</a>' +
          '</div>'
      };

      const overlay = document.createElement('div');
      overlay.className = 'avgrund-overlay';
      
      const popup = document.createElement('div');
      popup.className = 'avgrund-popup';
      if (document.documentElement.classList.contains('dark')) {
        popup.classList.add('dark');
      }

      let isOpen = false;
      let handleEscape;
      let handleOverlayClick;
      
      const cleanup = () => {
        if (handleEscape) {
          document.removeEventListener('keydown', handleEscape);
          handleEscape = null;
        }
        if (handleOverlayClick) {
          overlay.removeEventListener('click', handleOverlayClick);
          handleOverlayClick = null;
        }
        if (overlay.parentNode) {
          document.body.removeChild(overlay);
        }
        if (popup.parentNode) {
          document.body.removeChild(popup);
        }
        document.body.style.overflow = '';
        isOpen = false;
      };
      
      this.open = function(title, promotions) {
        // If already open, clean up first
        if (isOpen) {
          cleanup();
        }

        popup.innerHTML = (
          templates.header(title) +
          templates.content(promotions) +
          templates.footer()
        );
        
        document.body.appendChild(overlay);
        document.body.appendChild(popup);
        document.body.style.overflow = 'hidden';
        
        handleEscape = (e) => {
          if (e.key === 'Escape') this.close();
        };
        document.addEventListener('keydown', handleEscape);
        
        handleOverlayClick = (e) => {
          if (e.target === overlay) this.close();
        };
        overlay.addEventListener('click', handleOverlayClick);

        isOpen = true;
      };
      
      this.close = function() {
        cleanup();
      };

      // Cleanup on page unload
      window.addEventListener('unload', cleanup);
    }
    
    var avgrund = new Avgrund();
    
    window.showPromotionModal = function(title, promotions) {
      avgrund.open(title, promotions);
    };
  `;
  document.head.appendChild(script);
}

// Show promotion modal
export function showPromotionModal(title, promotions) {
  if (typeof avgrund !== 'undefined') {
    avgrund.open(title, promotions);
  }
} 