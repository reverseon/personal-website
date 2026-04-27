(function() {
  let activeTooltip = null;
  let showTimeout = null;
  let warmStateTimeout = null;
  let isWarm = false;

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
    box.style.transform = ''; 

    // Boundary detection
    const boxWidth = box.offsetWidth;
    const halfWidth = boxWidth / 2;
    const padding = 15; 

    const viewLeft = rect.left + (rect.width / 2) - halfWidth;
    const viewRight = rect.left + (rect.width / 2) + halfWidth;

    let originX = '50%';
    if (viewLeft < padding) {
      const shift = padding - viewLeft;
      left += shift;
      // Adjust origin to stay over trigger
      const percentage = 50 - (shift / boxWidth * 100);
      originX = `${percentage}%`;
    } else if (viewRight > viewportWidth - padding) {
      const shift = viewRight - (viewportWidth - padding);
      left -= shift;
      const percentage = 50 + (shift / boxWidth * 100);
      originX = `${percentage}%`;
    }

    box.style.left = `${left}px`;
    // Set origin to bottom (since it's above) and dynamic X
    box.style.transformOrigin = `${originX} bottom`;
  }

  function showTooltip(trigger) {
    const message = trigger.getAttribute('data-tooltip');
    if (!message) return;

    if (!activeTooltip) {
      activeTooltip = createTooltip();
    }

    const startShow = () => {
      activeTooltip.textContent = message;
      positionTooltip(trigger, activeTooltip);
      
      if (isWarm) {
        activeTooltip.classList.add('tooltip-box--instant');
      } else {
        activeTooltip.classList.remove('tooltip-box--instant');
      }

      // Force reflow
      activeTooltip.offsetHeight;
      activeTooltip.classList.add('tooltip-box--visible');
      isWarm = true;
      clearTimeout(warmStateTimeout);
    };

    if (isWarm) {
      startShow();
    } else {
      clearTimeout(showTimeout);
      showTimeout = setTimeout(startShow, 150);
    }
  }

  function hideTooltip() {
    clearTimeout(showTimeout);
    if (activeTooltip) {
      activeTooltip.classList.remove('tooltip-box--visible');
    }
    
    // Maintain warm state for 500ms after hiding
    clearTimeout(warmStateTimeout);
    warmStateTimeout = setTimeout(() => {
      isWarm = false;
    }, 500);
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

  window.addEventListener('scroll', () => {
    if (activeTooltip && activeTooltip.classList.contains('tooltip-box--visible')) {
        hideTooltip();
    }
  });
})();
