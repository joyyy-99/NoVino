// Mobile Menu
document.addEventListener('DOMContentLoaded', function () {
  const mobileMenuButton = document.querySelector('.mobile-menu-button');
  const mobileMenu = document.querySelector('.mobile-menu');
  mobileMenuButton.addEventListener('click', function () {
    mobileMenu.classList.toggle('hidden');
  });
  document.querySelectorAll('.mobile-menu a').forEach(link => {
    link.addEventListener('click', () => mobileMenu.classList.add('hidden'));
  });
});

// Continuous Product Carousel Functionality
class ContinuousCarousel {
  constructor(containerId, trackId, prevBtnId, nextBtnId) {
    this.container = document.getElementById(containerId);
    this.track = document.getElementById(trackId);
    this.prevBtn = document.getElementById(prevBtnId);
    this.nextBtn = document.getElementById(nextBtnId);
    this.currentIndex = 0;
    this.cardWidth = 296; // 280px + 16px gap
    this.visibleCards = this.getVisibleCards();
    this.originalCards = [];
    this.isTransitioning = false;
    
    this.init();
  }

  init() {
    if (!this.track || !this.prevBtn || !this.nextBtn) return;
    
    this.setupContinuousLoop();
    this.prevBtn.addEventListener('click', () => this.prev());
    this.nextBtn.addEventListener('click', () => this.next());
    
    // Handle window resize
    window.addEventListener('resize', () => {
      this.visibleCards = this.getVisibleCards();
      this.repositionCarousel();
    });
    
    // Handle transition end for seamless loop
    this.track.addEventListener('transitionend', () => this.handleTransitionEnd());
    
    this.repositionCarousel();
  }

  setupContinuousLoop() {
    // Store original cards
    this.originalCards = Array.from(this.track.children);
    const totalCards = this.originalCards.length;
    
    if (totalCards === 0) return;
    
    // Clone cards for continuous loop
    // Add clones at the beginning (for going backwards)
    for (let i = totalCards - 1; i >= 0; i--) {
      const clone = this.originalCards[i].cloneNode(true);
      clone.classList.add('clone');
      this.track.insertBefore(clone, this.track.firstChild);
    }
    
    // Add clones at the end (for going forwards)
    this.originalCards.forEach(card => {
      const clone = card.cloneNode(true);
      clone.classList.add('clone');
      this.track.appendChild(clone);
    });
    
    // Set initial position to show original cards
    this.currentIndex = totalCards;
  }

  getVisibleCards() {
    const containerWidth = this.container ? this.container.offsetWidth - 120 : 800;
    return Math.max(1, Math.floor(containerWidth / this.cardWidth));
  }

  getTotalOriginalCards() {
    return this.originalCards.length;
  }

  prev() {
    if (this.isTransitioning) return;
    
    this.isTransitioning = true;
    this.currentIndex--;
    this.updateCarousel();
  }

  next() {
    if (this.isTransitioning) return;
    
    this.isTransitioning = true;
    this.currentIndex++;
    this.updateCarousel();
  }

  updateCarousel() {
    if (!this.track) return;
    
    const translateX = -this.currentIndex * this.cardWidth;
    this.track.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    this.track.style.transform = `translateX(${translateX}px)`;
  }

  handleTransitionEnd() {
    this.isTransitioning = false;
    const totalOriginalCards = this.getTotalOriginalCards();
    
    // If we've gone past the end, jump to the beginning
    if (this.currentIndex >= totalOriginalCards * 2) {
      this.currentIndex = totalOriginalCards;
      this.jumpToPosition();
    }
    // If we've gone before the beginning, jump to the end
    else if (this.currentIndex <= -1) {
      this.currentIndex = totalOriginalCards - 1;
      this.jumpToPosition();
    }
  }

  jumpToPosition() {
    // Disable transition for instant jump
    this.track.style.transition = 'none';
    const translateX = -this.currentIndex * this.cardWidth;
    this.track.style.transform = `translateX(${translateX}px)`;
    
    // Re-enable transition after a brief delay
    setTimeout(() => {
      this.track.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    }, 10);
  }

  repositionCarousel() {
    if (!this.track) return;
    
    // Maintain current visual position after resize
    const translateX = -this.currentIndex * this.cardWidth;
    this.track.style.transform = `translateX(${translateX}px)`;
  }

  reset() {
    this.currentIndex = this.getTotalOriginalCards();
    this.track.style.transition = 'none';
    this.repositionCarousel();
    setTimeout(() => {
      this.track.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    }, 10);
  }

  // Auto-play functionality
  startAutoPlay(interval = 3000) {
    this.stopAutoPlay();
    this.autoPlayInterval = setInterval(() => {
      if (!this.isTransitioning) {
        this.next();
      }
    }, interval);
  }

  stopAutoPlay() {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
      this.autoPlayInterval = null;
    }
  }
}

// Tab Switching Functionality
class TabSwitcher {
  constructor() {
    this.everydayTab = document.getElementById("everyday-tab");
    this.eventsTab = document.getElementById("events-tab");
    this.everydayCarousel = document.getElementById("carousel-everyday");
    this.eventsCarousel = document.getElementById("carousel-events");
    this.toggleContainer = document.querySelector(".toggle-container");
    
    this.init();
  }

  init() {
    if (!this.everydayTab || !this.eventsTab) return;
    
    this.everydayTab.addEventListener("click", () => this.switchToEveryday());
    this.eventsTab.addEventListener("click", () => this.switchToEvents());
  }

  switchToEveryday() {
    this.everydayTab.classList.add("active");
    this.eventsTab.classList.remove("active");
    this.toggleContainer.classList.remove("events-active");
    this.everydayCarousel.classList.remove("hidden");
    this.eventsCarousel.classList.add("hidden");
    
    // Stop auto-play on events carousel and start on everyday
    if (window.eventsCarouselInstance) {
      window.eventsCarouselInstance.stopAutoPlay();
    }
    if (window.everydayCarouselInstance) {
      window.everydayCarouselInstance.startAutoPlay();
    }
  }

  switchToEvents() {
    this.eventsTab.classList.add("active");
    this.everydayTab.classList.remove("active");
    this.toggleContainer.classList.add("events-active");
    this.eventsCarousel.classList.remove("hidden");
    this.everydayCarousel.classList.add("hidden");
    
    // Stop auto-play on everyday carousel and start on events
    if (window.everydayCarouselInstance) {
      window.everydayCarouselInstance.stopAutoPlay();
    }
    if (window.eventsCarouselInstance) {
      window.eventsCarouselInstance.startAutoPlay();
    }
  }
}

// Enhanced Touch/Swipe Support
class TouchCarousel {
  constructor(trackElement, carouselInstance) {
    this.track = trackElement;
    this.carousel = carouselInstance;
    this.startX = 0;
    this.currentX = 0;
    this.isDragging = false;
    this.threshold = 50;
    this.startTime = 0;
    
    this.init();
  }

  init() {
    if (!this.track) return;
    
    // Touch events
    this.track.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: true });
    this.track.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
    this.track.addEventListener('touchend', () => this.handleTouchEnd());
    
    // Mouse events for desktop
    this.track.addEventListener('mousedown', (e) => this.handleMouseDown(e));
    this.track.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    this.track.addEventListener('mouseup', () => this.handleMouseUp());
    this.track.addEventListener('mouseleave', () => this.handleMouseUp());
    
    // Prevent dragging images
    this.track.addEventListener('dragstart', (e) => e.preventDefault());
  }

  handleTouchStart(e) {
    this.startX = e.touches[0].clientX;
    this.startTime = Date.now();
    this.isDragging = true;
    this.carousel.stopAutoPlay();
  }

  handleTouchMove(e) {
    if (!this.isDragging) return;
    this.currentX = e.touches[0].clientX;
    
    // Prevent scrolling when swiping horizontally
    if (Math.abs(this.startX - this.currentX) > 10) {
      e.preventDefault();
    }
  }

  handleTouchEnd() {
    if (!this.isDragging) return;
    
    const deltaX = this.startX - this.currentX;
    const deltaTime = Date.now() - this.startTime;
    const velocity = Math.abs(deltaX) / deltaTime;
    
    // Determine if it's a swipe based on distance and velocity
    if (Math.abs(deltaX) > this.threshold || velocity > 0.5) {
      if (deltaX > 0) {
        this.carousel.next();
      } else {
        this.carousel.prev();
      }
    }
    
    this.isDragging = false;
    this.carousel.startAutoPlay();
  }

  handleMouseDown(e) {
    this.startX = e.clientX;
    this.startTime = Date.now();
    this.isDragging = true;
    this.track.style.cursor = 'grabbing';
    this.carousel.stopAutoPlay();
    e.preventDefault();
  }

  handleMouseMove(e) {
    if (!this.isDragging) return;
    this.currentX = e.clientX;
  }

  handleMouseUp() {
    if (!this.isDragging) return;
    
    const deltaX = this.startX - this.currentX;
    const deltaTime = Date.now() - this.startTime;
    const velocity = Math.abs(deltaX) / deltaTime;
    
    if (Math.abs(deltaX) > this.threshold || velocity > 0.5) {
      if (deltaX > 0) {
        this.carousel.next();
      } else {
        this.carousel.prev();
      }
    }
    
    this.isDragging = false;
    this.track.style.cursor = 'grab';
    this.carousel.startAutoPlay();
  }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Initialize tab switcher
  const tabSwitcher = new TabSwitcher();
  
  // Initialize continuous carousels
  window.everydayCarouselInstance = new ContinuousCarousel(
    'carousel-everyday',
    'carousel-track-everyday',
    'prev-everyday',
    'next-everyday'
  );
  
  window.eventsCarouselInstance = new ContinuousCarousel(
    'carousel-events',
    'carousel-track-events',
    'prev-events',
    'next-events'
  );
  
  // Initialize touch/swipe support with carousel instances
  const everydayTrack = document.getElementById('carousel-track-everyday');
  const eventsTrack = document.getElementById('carousel-track-events');
  
  if (everydayTrack && window.everydayCarouselInstance) {
    new TouchCarousel(everydayTrack, window.everydayCarouselInstance);
  }
  
  if (eventsTrack && window.eventsCarouselInstance) {
    new TouchCarousel(eventsTrack, window.eventsCarouselInstance);
  }
  
  // Add smooth scrolling cursor styles
  const tracks = document.querySelectorAll('.product-carousel');
  tracks.forEach(track => {
    track.style.cursor = 'grab';
  });
  
  // Start auto-play on the visible carousel
  if (window.everydayCarouselInstance) {
    window.everydayCarouselInstance.startAutoPlay(4000); // 4 seconds
  }
  
  // Pause auto-play when user hovers over carousel
  const carouselContainers = document.querySelectorAll('.carousel-container');
  carouselContainers.forEach((container, index) => {
    const carouselInstance = index === 0 ? window.everydayCarouselInstance : window.eventsCarouselInstance;
    
    container.addEventListener('mouseenter', () => {
      if (carouselInstance) carouselInstance.stopAutoPlay();
    });
    
    container.addEventListener('mouseleave', () => {
      if (carouselInstance && !container.classList.contains('hidden')) {
        carouselInstance.startAutoPlay(4000);
      }
    });
  });
});

// VinoBot & Form Features
document.addEventListener('DOMContentLoaded', function () {
  const checkbox = document.getElementById('newsletter-checkbox');
  checkbox?.addEventListener('click', () => {
    checkbox.classList.toggle('checked');
  });

  const vinobotInput = document.getElementById('vinobot-input');
  const vinobotSendButton = vinobotInput?.nextElementSibling;

  vinobotSendButton?.addEventListener('click', function () {
    const message = vinobotInput.value.trim();
    if (message) {
      const chatContainer = vinobotInput.closest('.bg-white').querySelector('.p-6');

      const userMessage = document.createElement('div');
      userMessage.className = 'flex mb-4 justify-end';
      userMessage.innerHTML = `
        <div class="bg-primary bg-opacity-10 text-gray-800 rounded-lg rounded-tr-none p-3 max-w-[80%]">
          <p class="body-text">${message}</p>
        </div>
        <div class="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full ml-3 flex-shrink-0">
          <i class="ri-user-line"></i>
        </div>
      `;
      chatContainer.appendChild(userMessage);
      vinobotInput.value = '';
      chatContainer.scrollTop = chatContainer.scrollHeight;

      setTimeout(() => {
        const botMessage = document.createElement('div');
        botMessage.className = 'flex mb-4';
        botMessage.innerHTML = `
          <div class="w-8 h-8 flex items-center justify-center bg-primary text-white rounded-full mr-3 flex-shrink-0">
            <i class="ri-robot-line"></i>
          </div>
          <div class="bg-gray-100 rounded-lg rounded-tl-none p-3 max-w-[80%]">
            <p class="body-text">Thanks! Tell me your favorite flavors and I’ll suggest the perfect NoVino.</p>
          </div>
        `;
        chatContainer.appendChild(botMessage);
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }, 1000);
    }
  });

  vinobotInput?.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') vinobotSendButton.click();
  });
});

// FAQ Toggle
const faqButtons = document.querySelectorAll('.faq-question');

faqButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const thisItem = btn.parentElement;

    // Close all other open items
    document.querySelectorAll('.faq-item').forEach((item) => {
      if (item !== thisItem) {
        item.classList.remove('open');
        item.querySelector('.icon').textContent = '+';
      }
    });

    // Toggle current item
    const isOpen = thisItem.classList.contains('open');
    thisItem.classList.toggle('open');
    btn.querySelector('.icon').textContent = isOpen ? '+' : '×';
  });
});



// Visitor Counter
document.addEventListener('DOMContentLoaded', function () {
  let visits = localStorage.getItem('visitorCount') || 0;
  visits = parseInt(visits) + 1;
  localStorage.setItem('visitorCount', visits);
  const formattedVisits = new Intl.NumberFormat().format(visits + 12487);
  document.getElementById('visitor-counter').textContent = formattedVisits;
});
