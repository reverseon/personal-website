(function() {
  // Handle share button clicks
  document.addEventListener('click', function(e) {
    const shareBtn = e.target.closest('.share-thought-btn');
    if (!shareBtn) return;

    const thoughtId = shareBtn.dataset.thoughtId;
    if (!thoughtId) return;

    // Build the fetcher URL
    const fetcherUrl = `${window.location.origin}/carriages/fetcher.html?id=${thoughtId}`;

    // Copy to clipboard
    navigator.clipboard.writeText(fetcherUrl).then(() => {
      // Visual feedback
      shareBtn.classList.add('copied');

      // Reset after 2 seconds
      setTimeout(() => {
        shareBtn.classList.remove('copied');
      }, 2000);
    }).catch(err => {
      console.error('Failed to copy:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = fetcherUrl;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        shareBtn.classList.add('copied');
        setTimeout(() => {
          shareBtn.classList.remove('copied');
        }, 2000);
      } catch (err) {
        console.error('Fallback copy failed:', err);
      }
      document.body.removeChild(textArea);
    });
  });
})();
