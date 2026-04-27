(function() {
  let activeTooltip = null;

  function createTooltip() {
    const box = document.createElement('div');
    box.className = 'tooltip-box';
    document.body.appendChild(box);
    return box;
  }

  function positionTooltip(trigger, box) {
    const rect = trigger.getBoundingClientRect();
    const scrollY = window.scrollY || window.pageYOffset;
    const scrollX = window.scrollX || window.pageXOffset;
    const viewportWidth = window.innerWidth;

    // Center horizontally by default
    let left = rect.left + scrollX + (rect.width / 2);
    // Position above
    const top = rect.top + scrollY - 12;

    box.style.left = `${left}px`;
    box.style.top = `${top}px`;
    // We remove the inline transform and let CSS handle the translateX(-50%) and animations
    box.style.transform = ''; 

    // Boundary detection: check if the tooltip is bleeding out of the viewport
    // We need to wait for the next frame or force a layout to get the correct boxRect
    // but since we are centering with translateX(-50%), we can calculate the bounds.
    const boxWidth = box.offsetWidth;
    const halfWidth = boxWidth / 2;
    const padding = 15; // Safe margin from edges

    // Calculate the left/right position relative to the viewport (not including scroll)
    const viewLeft = rect.left + (rect.width / 2) - halfWidth;
    const viewRight = rect.left + (rect.width / 2) + halfWidth;

    if (viewLeft < padding) {
      // Shifting to the right
      const shift = padding - viewLeft;
      left += shift;
    } else if (viewRight > viewportWidth - padding) {
      // Shifting to the left
      const shift = viewRight - (viewportWidth - padding);
      left -= shift;
    }

    box.style.left = `${left}px`;
  }

  function showTooltip(trigger) {
    const message = trigger.getAttribute('data-tooltip');
    if (!message) return;

    if (!activeTooltip) {
      activeTooltip = createTooltip();
    }

    activeTooltip.textContent = message;
    positionTooltip(trigger, activeTooltip);
    
    // Force reflow
    activeTooltip.offsetHeight;
    activeTooltip.classList.add('tooltip-box--visible');
  }

  function hideTooltip() {
    if (activeTooltip) {
      activeTooltip.classList.remove('tooltip-box--visible');
    }
  }

  document.addEventListener('mouseover', (e) => {
    const trigger = e.target.closest('.tooltip-trigger');
    if (trigger) {
      showTooltip(trigger);
    }
  });

  document.addEventListener('mouseout', (e) => {
    const trigger = e.target.closest('.tooltip-trigger');
    if (trigger) {
      hideTooltip();
    }
  });

  // Optional: Update position on scroll if still visible
  window.addEventListener('scroll', () => {
    if (activeTooltip && activeTooltip.classList.contains('tooltip-box--visible')) {
        // Find the trigger that is currently being hovered
        // This is a bit tricky with event delegation, but for now we can just hide it on scroll
        // or let it float. Hiding is safer.
        hideTooltip();
    }
  });
})();
