document.addEventListener('DOMContentLoaded', () => {
  // Prevent category and tag clicks from triggering post navigation
  document.querySelectorAll('.category-tag, .tag-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  });
});
