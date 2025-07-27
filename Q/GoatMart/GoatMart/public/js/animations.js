
// Animation utilities
const fadeIn = (element, duration = 300) => {
  element.style.opacity = 0;
  element.style.display = 'block';
  
  let start = null;
  const animate = (timestamp) => {
    if (!start) start = timestamp;
    const progress = timestamp - start;
    element.style.opacity = Math.min(progress / duration, 1);
    
    if (progress < duration) {
      requestAnimationFrame(animate);
    }
  };
  requestAnimationFrame(animate);
};

const slideIn = (element, direction = 'right', duration = 300) => {
  const start = direction === 'right' ? 20 : -20;
  element.style.transform = `translateX(${start}px)`;
  element.style.opacity = 0;
  element.style.display = 'block';
  
  element.animate([
    { transform: `translateX(${start}px)`, opacity: 0 },
    { transform: 'translateX(0)', opacity: 1 }
  ], {
    duration,
    easing: 'ease-out',
    fill: 'forwards'
  });
};

// Export animations
window.uiAnimations = {
  fadeIn,
  slideIn
};
