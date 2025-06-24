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

// Visitor Counter (localStorage)
document.addEventListener('DOMContentLoaded', function () {
    const counterElement = document.getElementById('visitor-counter');

    if (counterElement) {
        let visits;

        // 1. Get the current count from localStorage
        // localStorage stores data as strings, so we need to parse it to a number
        const storedVisits = localStorage.getItem('siteVisits');

        if (storedVisits) {
            // If data exists, parse it and increment
            visits = parseInt(storedVisits, 10) + 1;
        } else {
            // If no data exists, initialize to 1 (first visit)
            visits = 1;
        }

        // 2. Store the new count back into localStorage
        localStorage.setItem('siteVisits', visits.toString()); // Convert back to string for storage

        // 3. Display the count on the page
        const formattedVisits = new Intl.NumberFormat().format(visits);
        counterElement.textContent = formattedVisits;
    }
});

// VinoBot Chat Functionality
document.addEventListener('DOMContentLoaded', function() {
  
  // Comprehensive NoVino knowledge base
  const novinoKnowledge = {
    // Company basics
    'mission': "NoVino's mission is to provide sophisticated, flavorful non-alcoholic alternatives that celebrate Kenyan heritage, support mindful drinking choices, and foster inclusive social gatherings. Every bottle is vibrant, inclusive, and sustainably sourced from local farmers.",
    
    'story': "NoVino was born from the vibrant post-Detty December celebrations in Nairobi. Three friends wanted to continue the social joy of gathering during Dry January without alcohol, so they created premium non-alcoholic drinks using traditional Kenyan ingredients.",
    
    'founders': "NoVino was founded by three friends: Joy Awino (CEO & Flavor Specialist with food science background), Joseph Chege (COO & Sustainability Lead managing sourcing & operations), and Stacey Kimani (CMO & Creative Director leading marketing & brand storytelling).",
    
    'vision': "To be East Africa's leading non-alcoholic brand that redefines celebration through culture-forward, alcohol-free experiences. Long-term, NoVino aims to expand across Africa and globally while maintaining ethical sourcing and local pride.",
    
    // Products - Everyday Line
    'products': "NoVino offers two product lines: Everyday drinks (Hibiscus Harmony, Tamarind Twist, Moringa Mist, Baobab Bliss) and Event drinks (Celebration Sparkle, Wedding Rose, Corporate Classic). All are crafted with traditional Kenyan ingredients.",
    
    'hibiscus': "Hibiscus Harmony is our refreshing blend of hibiscus flowers with subtle notes of ginger and lemon. It's antioxidant-rich, low sugar, and caffeine-free - perfect for warm Nairobi evenings!",
    
    'tamarind': "Tamarind Twist offers a tangy, sweet blend of tamarind and honey with a hint of cardamom. It's vitamin-rich, acts as a digestive aid, and uses natural sweeteners - a sophisticated alternative to traditional cocktails.",
    
    'moringa': "Moringa Mist is a light, refreshing blend of moringa leaves, cucumber, and mint. It's nutrient-dense, energizing, and has zero calories - the perfect daytime refreshment with health benefits.",
    
    'baobab': "Baobab Bliss is a creamy, smooth blend of baobab fruit, coconut milk, and vanilla. It's high fiber, prebiotic, and plant-based - like a delicious dessert alternative with a Kenyan twist.",
    
    // Products - Events Line
    'celebration': "Celebration Sparkle is our sophisticated sparkling blend perfect for toasts and special occasions. It features notes of green apple and elderflower and is alcohol-free, bubbly, and premium quality.",
    
    'wedding': "Wedding Rose is a delicate rose-colored blend with hints of strawberry and rose petals. It's elegant, romantic, and perfect for wedding celebrations and special romantic occasions.",
    
    'corporate': "Corporate Classic is a sophisticated blend designed for business events and corporate gatherings. It features complex notes of berries and oak, making it professional, sophisticated, and premium.",
    
    // Contact and business
    'contact': "You can reach NoVino at: 📍 Kilimani Business Center, Nairobi, Kenya 📧 hello@novino.co.ke 📞 +254 712 345 678. Follow us on Instagram, Facebook, Twitter, and LinkedIn for updates!",
    
    'shipping': "Currently, NoVino ships throughout East Africa. We're working on expanding our shipping network to reach more international customers. Sign up for our newsletter to stay updated on shipping availability.",
    
    'sustainability': "We source ingredients ethically from local farmers across Kenya, supporting sustainable agriculture. Our packaging is eco-friendly to minimize environmental impact, and we maintain direct relationships with our suppliers.",
    
    // Values and culture
    'values': "NoVino's core values are: Vibrant (celebrating Kenya's rich culture in every bottle), Inclusive (everyone deserves to be part of celebrations), and Sustainable (ethical sourcing and eco-friendly practices)."
  };

  // Function to normalize text for better matching (FIXED)
  function normalizeText(text) {
    return text.toLowerCase()
      .replace(/[^\w\s]/g, ' ') // Replace all punctuation with spaces
      .replace(/\s+/g, ' ')     // Normalize multiple spaces to single space
      .trim();
  }

  // Function to check if question contains keywords (IMPROVED)
  function containsKeywords(question, keywords) {
    const normalizedQuestion = normalizeText(question);
    return keywords.some(keyword => normalizedQuestion.includes(keyword.toLowerCase()));
  }

  // Function to find the best response (COMPLETELY REWRITTEN)
  function getResponse(question) {
    const normalizedQuestion = normalizeText(question);
    
    // Mission and purpose keywords
    if (containsKeywords(question, ['mission', 'purpose', 'goal', 'why novino', 'what does novino do'])) {
      return novinoKnowledge.mission;
    }
    
    // Story and history
    if (containsKeywords(question, ['story', 'history', 'origin', 'started', 'began', 'how novino began'])) {
      return novinoKnowledge.story;
    }
    
    // Founders and team
    if (containsKeywords(question, ['founder', 'founded', 'who created', 'team', 'owner', 'who started', 'who founded'])) {
      return novinoKnowledge.founders;
    }
    
    // Vision and future
    if (containsKeywords(question, ['vision', 'future', 'long term', 'expansion', 'goal', 'long-term'])) {
      return novinoKnowledge.vision;
    }
    
    // Products general
    if (containsKeywords(question, ['product', 'drink', 'beverage', 'what do you sell', 'what products', 'what drinks'])) {
      return novinoKnowledge.products;
    }
    
    // Specific products
    if (containsKeywords(question, ['hibiscus', 'harmony'])) {
      return novinoKnowledge.hibiscus;
    }
    
    if (containsKeywords(question, ['tamarind', 'twist'])) {
      return novinoKnowledge.tamarind;
    }
    
    if (containsKeywords(question, ['moringa', 'mist'])) {
      return novinoKnowledge.moringa;
    }
    
    if (containsKeywords(question, ['baobab', 'bliss'])) {
      return novinoKnowledge.baobab;
    }
    
    if (containsKeywords(question, ['celebration', 'sparkle', 'sparkling'])) {
      return novinoKnowledge.celebration;
    }
    
    if (containsKeywords(question, ['wedding', 'rose'])) {
      return novinoKnowledge.wedding;
    }
    
    if (containsKeywords(question, ['corporate', 'classic', 'business'])) {
      return novinoKnowledge.corporate;
    }
    
    // Contact information
    if (containsKeywords(question, ['contact', 'reach', 'phone', 'email', 'address', 'how to contact'])) {
      return novinoKnowledge.contact;
    }
    
    // Shipping
    if (containsKeywords(question, ['shipping', 'delivery', 'international', 'ship'])) {
      return novinoKnowledge.shipping;
    }
    
    // Sustainability
    if (containsKeywords(question, ['sustainable', 'sustainability', 'ethical', 'local farmers', 'environment'])) {
      return novinoKnowledge.sustainability;
    }
    
    // Values
    if (containsKeywords(question, ['values', 'principles', 'beliefs', 'what novino believes'])) {
      return novinoKnowledge.values;
    }
    
    // Fallback responses for common patterns
    if (containsKeywords(question, ['hello', 'hi', 'hey'])) {
      return "Hello! I'm VinoBot, your guide to NoVino's premium non-alcoholic drinks. I can tell you about our products, story, team, or help you find the perfect drink for any occasion. What would you like to know?";
    }

    if (containsKeywords(question, ['price', 'cost', 'buy', 'purchase', 'how much'])) {
      return "For pricing information and to place orders, please contact us at hello@novino.co.ke or +254 712 345 678. We offer competitive rates for both individual bottles and bulk orders!";
    }

    if (containsKeywords(question, ['ingredients', 'kenyan', 'what is in'])) {
      return "All our drinks use traditional Kenyan botanicals like hibiscus, tamarind, moringa, and baobab. We source ethically from local farmers to celebrate Kenya's rich heritage while supporting sustainable agriculture!";
    }

    if (containsKeywords(question, ['alcohol', 'alcoholic', 'alcohol free', 'non alcoholic'])) {
      return "Yes, all NoVino beverages are 100% alcohol-free! Our drinks are crafted using natural ingredients and traditional Kenyan botanicals, making them perfect for those who choose not to consume alcohol or for events like Dry January.";
    }

    // Default response
    return "That's a great question! NoVino specializes in premium non-alcoholic drinks made with traditional Kenyan ingredients. We have everyday drinks like Hibiscus Harmony and Tamarind Twist, plus event drinks like Celebration Sparkle. What specific aspect would you like to know more about - our products, story, or how to get in touch?";
  }

  // Get DOM elements
  const chatInput = document.getElementById('chat-input');
  const sendBtn = document.getElementById('send-btn');
  const chatBody = document.getElementById('chatbox-body');

  if (!chatInput || !sendBtn || !chatBody) {
    console.error('VinoBot: Required elements not found');
    return;
  }

  // Function to add a message to the chat
  function addMessage(content, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${isUser ? 'user' : 'bot'}`;
    
    messageDiv.innerHTML = `
      <div class="message-avatar ${isUser ? 'user' : 'bot'}">
        <i class="ri-${isUser ? 'user-3-line' : 'robot-2-line'}"></i>
      </div>
      <div class="message-content">
        <p>${content}</p>
      </div>
    `;
    
    chatBody.appendChild(messageDiv);
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  // Function to add typing indicator
  function addTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'chat-message bot';
    typingDiv.id = 'typing-indicator';
    
    typingDiv.innerHTML = `
      <div class="message-avatar bot">
        <i class="ri-robot-2-line"></i>
      </div>
      <div class="message-content">
        <div class="typing-indicator">
          <span>VinoBot is typing</span>
          <div class="typing-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    `;
    
    chatBody.appendChild(typingDiv);
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  // Function to remove typing indicator
  function removeTypingIndicator() {
    const typing = document.getElementById('typing-indicator');
    if (typing) {
      typing.remove();
    }
  }

  // Function to send a message
  function sendMessage() {
    const message = chatInput.value.trim();
    if (!message) return;
    
    // Add user message
    addMessage(message, true);
    chatInput.value = '';
    
    // Show typing indicator
    addTypingIndicator();
    sendBtn.disabled = true;
    
    // Simulate response delay for more realistic feel
    setTimeout(() => {
      removeTypingIndicator();
      const response = getResponse(message);
      addMessage(response);
      sendBtn.disabled = false;
      chatInput.focus();
    }, Math.random() * 1000 + 800); // Random delay between 0.8-1.8 seconds
  }

  // Function to ask predefined questions (from sample buttons) - FIXED
  window.askQuestion = function(question) {
    chatInput.value = question;
    sendMessage();
  }

  // Event listeners
  sendBtn.addEventListener('click', sendMessage);
  
  chatInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
  });

  // Enable/disable send button based on input
  chatInput.addEventListener('input', function() {
    sendBtn.disabled = this.value.trim() === '';
  });

  // Initialize with disabled send button
  sendBtn.disabled = true;

// Scroll to top on logo click
document.querySelector('.logo').addEventListener('click', (e) => {
  e.preventDefault(); // Prevent default anchor behavior if logo is an <a> tag
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Toggle side menu
const mobileMenuButton = document.querySelector('.mobile-menu-button');
const mobileMenu = document.querySelector('.mobile-menu');
const closeButton = document.createElement('button');
closeButton.classList.add('close-button');
closeButton.innerHTML = '&times;'; // Close icon (×)
mobileMenu.prepend(closeButton); // Add close button to menu

mobileMenuButton.addEventListener('click', () => {
  mobileMenu.classList.toggle('active');
});

closeButton.addEventListener('click', () => {
  mobileMenu.classList.remove('active');
});

// Close menu when clicking a link
mobileMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('active');
  });
});
});
