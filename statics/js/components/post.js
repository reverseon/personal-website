(function() {
  // Handle share button clicks — toast and copy logic is in share-btn.js
  document.addEventListener('click', function(e) {
    const shareBtn = e.target.closest('.share-post-btn');
    if (!shareBtn) return;

    const postSlug = shareBtn.dataset.postSlug;
    if (!postSlug) return;

    const postUrl = `${window.location.origin}/post/${postSlug}.html`;
    window.ShareBtn.handleShare(shareBtn, postUrl);
  });
})();
