console.log("Global scripts loaded.");

// Smooth scroll to hash target on page load with highlight effect
document.addEventListener('DOMContentLoaded', function() {
  if (window.location.hash) {
    const id = window.location.hash.substring(1);
    const target = document.getElementById(id);
    if (target) {
      // Small delay to ensure page is fully rendered
      setTimeout(function() {
        const offset = 50;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: top, behavior: 'smooth' });
        target.classList.add('hash-highlight');
      }, 100);
    }
  }
});