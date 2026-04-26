(function() {
  // Handle share button clicks — toast and copy logic is in share-btn.js
  document.addEventListener('click', function(e) {
    const shareBtn = e.target.closest('.share-thought-btn');
    if (!shareBtn) return;

    const thoughtId = shareBtn.dataset.thoughtId;
    if (!thoughtId) return;

    const fetcherUrl = `${window.location.origin}/carriages/fetcher.html?id=${thoughtId}`;
    window.ShareBtn.handleShare(shareBtn, fetcherUrl);
  });
})();
