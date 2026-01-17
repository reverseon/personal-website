(function() {
  // Parse query string to get the thought ID
  const urlParams = new URLSearchParams(window.location.search);
  const thoughtId = urlParams.get('id');

  if (!thoughtId) {
    document.querySelector('.fetcher-message p').textContent = 'Error: No thought ID provided';
    return;
  }

  // Get the thought page map from the embedded data
  const thoughtPageMap = window.thoughtPageMap;

  if (!thoughtPageMap || !thoughtPageMap[thoughtId]) {
    document.querySelector('.fetcher-message p').textContent = 'Error: Thought not found';
    return;
  }

  // Get the page number for this thought
  const pageNumber = thoughtPageMap[thoughtId];

  // Redirect to the thought page with hash
  const targetUrl = `/carriages/${pageNumber}.html#${thoughtId}`;

  // Small delay for visual feedback, then redirect
  setTimeout(() => {
    window.location.href = targetUrl;
  }, 500);
})();
