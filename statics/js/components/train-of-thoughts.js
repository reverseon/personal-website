(function() {
  // Handle share button clicks — toast and copy logic is in share-btn.js
  document.addEventListener('click', function(e) {
    const shareBtn = e.target.closest('.share-thought-btn');
    if (!shareBtn) return;

    const thoughtId = shareBtn.dataset.thoughtId;
    if (!thoughtId) return;

    const shareUrl = `${window.location.origin}/thought/${thoughtId}.html`;
    window.ShareBtn.handleShare(shareBtn, shareUrl);
  });
})();
