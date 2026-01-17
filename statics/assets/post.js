(function() {
  // Handle share button clicks
  document.addEventListener('click', function(e) {
    const shareBtn = e.target.closest('.share-post-btn');
    if (!shareBtn) return;

    const postSlug = shareBtn.dataset.postSlug;
    if (!postSlug) return;

    // Build the post URL
    const postUrl = `${window.location.origin}/post/${postSlug}.html`;

    // Copy to clipboard
    navigator.clipboard.writeText(postUrl).then(() => {
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
      textArea.value = postUrl;
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
