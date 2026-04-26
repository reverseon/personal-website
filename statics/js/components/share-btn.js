(function() {
  function showToast(anchorEl, message) {
    const existing = document.querySelector('.share-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'share-toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    const rect = anchorEl.getBoundingClientRect();
    const scrollY = window.scrollY || window.pageYOffset;
    toast.style.left = `${rect.left + rect.width / 2}px`;
    toast.style.top = `${rect.top + scrollY - 8}px`;

    requestAnimationFrame(() => {
      toast.classList.add('share-toast--visible');
    });

    setTimeout(() => {
      toast.classList.add('share-toast--hidden');
      toast.addEventListener('transitionend', () => toast.remove(), { once: true });
    }, 1800);
  }

  function copyUrl(url, btn) {
    btn.classList.add('copied');
    showToast(btn, 'Link copied!');
    setTimeout(() => btn.classList.remove('copied'), 2000);
  }

  function handleShare(btn, url) {
    if (!url) return;

    navigator.clipboard.writeText(url).then(() => {
      copyUrl(url, btn);
    }).catch(() => {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        copyUrl(url, btn);
      } catch (err) {
        console.error('Copy failed:', err);
      }
      document.body.removeChild(textArea);
    });
  }

  // Listen for any element with data-share-url
  document.addEventListener('click', function(e) {
    const btn = e.target.closest('[data-share-url]');
    if (!btn) return;
    handleShare(btn, btn.dataset.shareUrl);
  });

  // Expose for use by component scripts that build the URL dynamically
  window.ShareBtn = { handleShare };
})();
