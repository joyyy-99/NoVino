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
const context = `
You are VinoBot, a friendly, knowledgeable assistant for NoVino — a premium Kenyan non-alcoholic drinks startup.

Origin:
NoVino was born out of the post-Detty December scene in Nairobi. Three close friends wanted to extend the joy of social celebrations into Dry January, without alcohol. Their solution? Beautifully crafted, culturally rooted, alcohol-free drinks.

Mission:
NoVino’s mission is to provide sophisticated, flavorful non-alcoholic alternatives that celebrate Kenyan heritage, support mindful choices, and foster inclusive social gatherings. Every bottle is vibrant, inclusive, and sustainably sourced.

Products:
NoVino currently offers two drink lines:
1. Everyday Line:
- Hibiscus Harmony: hibiscus, ginger, lemon. Antioxidant-rich, low sugar, caffeine-free.
- Tamarind Twist: tamarind, cardamom, honey. Digestive aid, vitamin-rich.
- Moringa Mist: moringa, cucumber, mint. Zero-calorie, nutrient-dense, energizing.
- Baobab Bliss: baobab, coconut milk, vanilla. Plant-based, high fiber, prebiotic.

2. Events Line:
- Celebration Sparkle: sparkling green apple & elderflower. Alcohol-free, bubbly, premium.
- Wedding Rose: strawberry and rose petal. Elegant, romantic, celebratory.
- Corporate Classic: berries and oak. Sophisticated, professional.

Team:
- Joy Awino, CEO & Flavor Specialist: food science background, leads product dev.
- Joseph Chege, COO & Sustainability Lead: manages sourcing & ops with local farmers.
- Stacey Kimani, CMO & Creative Director: leads marketing & brand storytelling.

Vision:
To be East Africa’s leading non-alcoholic brand that redefines celebration through culture-forward, alcohol-free experiences. Long-term, NoVino aims to expand across Africa and globally while maintaining ethical sourcing and local pride.

How to Reach Us:
📍 Kilimani Business Center, Nairobi  
📧 hello@novino.co.ke  
📞 +254 712 345 678  
Follow us on Instagram, Twitter, Facebook, and LinkedIn.

Use warm, local, celebratory language. Never say "I don't know" — politely guide users based on what you’ve been told.
`;
const chatInput = document.querySelector('.chatbox-input input');
const sendBtn = document.querySelector('.chatbox-input button');
const chatBody = document.querySelector('.chatbox-body');

sendBtn.addEventListener('click', async () => {
  const question = chatInput.value.trim();
  if (!question) {
    alert('Please enter a question!');
    return;
  }

  appendMessage('user', question);
  chatInput.value = '';

  appendMessage('bot', 'Typing...');

  try {
    const response = await puter.ai.chat({
      messages: [
        { role: 'system', content: novinoContext },
        { role: 'user', content: question }
      ]
    });

    removeLastMessageIfTyping();
    appendMessage('bot', response.choices[0].message.content);
  } catch (error) {
    removeLastMessageIfTyping();
    appendMessage('bot', 'Oops! Something went wrong.');
    console.error(error);
  }
});

function appendMessage(role, text) {
  const msgDiv = document.createElement('div');
  msgDiv.className = `chat-message ${role}`;
  msgDiv.innerHTML = `<p>${text}</p>`;
  chatBody.appendChild(msgDiv);
  chatBody.scrollTop = chatBody.scrollHeight;
}

function removeLastMessageIfTyping() {
  const last = chatBody.lastElementChild;
  if (last && last.textContent === 'Typing...') {
    chatBody.removeChild(last);
  }
}
// VinoBot Chat Functionality
document.addEventListener('DOMContentLoaded', function() {
  
  // NoVino context for the chatbot responses
  const responses = {
    "who founded novino": "NoVino was founded by three friends: Joy Awino (CEO & Flavor Specialist), Joseph Chege (COO & Sustainability Lead), and Stacey Kimani (CMO & Creative Director). They created NoVino after wanting to continue social celebrations during Dry January in Nairobi.",
    
    "what problem does novino solve": "NoVino solves the problem of limited premium non-alcoholic options during social gatherings. Born from the post-Detty December scene in Nairobi, we provide sophisticated alternatives for Dry January and mindful drinking choices.",
    
    "what are novino's products": "We offer two product lines: Everyday drinks (Hibiscus Harmony, Tamarind Twist, Moringa Mist, Baobab Bliss) and Event drinks (Celebration Sparkle, Wedding Rose, Corporate Classic). All are crafted with traditional Kenyan ingredients.",
    
    "how can i contact novino": "You can reach us at: 📍 Kilimani Business Center, Nairobi 📧 hello@novino.co.ke 📞 +254 712 345 678. Follow us on social media for updates!",
    
    "what's novino's long-term goal": "Our vision is to become East Africa's leading non-alcoholic brand, redefining celebration through culture-forward, alcohol-free experiences. We aim to expand across Africa while maintaining ethical sourcing and local pride.",
    
    "default": "That's a great question! NoVino specializes in premium non-alcoholic drinks made with traditional Kenyan ingredients. We have everyday drinks like Hibiscus Harmony and event drinks like Celebration Sparkle. What specific aspect would you like to know more about?"
  };

  // Get DOM elements
  const chatInput = document.getElementById('chat-input');
  const sendBtn = document.getElementById('send-btn');
  const chatBody = document.getElementById('chatbox-body');

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

  // Function to get response based on user input
  function getResponse(question) {
    const normalizedQuestion = question.toLowerCase().trim();
    
    // Check for specific questions
    for (let key in responses) {
      if (normalizedQuestion.includes(key.replace(/'/g, ""))) {
        return responses[key];
      }
    }
    
    // Check for product-specific questions
    if (normalizedQuestion.includes('hibiscus')) {
      return "Hibiscus Harmony is our refreshing blend of hibiscus flowers with ginger and lemon. It's antioxidant-rich, low sugar, and caffeine-free - perfect for warm Nairobi evenings!";
    }
    
    if (normalizedQuestion.includes('tamarind')) {
      return "Tamarind Twist offers a tangy, sweet blend of tamarind and honey with cardamom. It's vitamin-rich and acts as a digestive aid - a sophisticated cocktail alternative!";
    }
    
    if (normalizedQuestion.includes('moringa')) {
      return "Moringa Mist is a light, refreshing blend of moringa leaves, cucumber, and mint. It's nutrient-dense, energizing, and has zero calories - perfect for daytime refreshment!";
    }
    
    if (normalizedQuestion.includes('baobab')) {
      return "Baobab Bliss is a creamy, smooth blend of baobab fruit, coconut milk, and vanilla. It's high fiber, prebiotic, and plant-based - like a healthy dessert with a Kenyan twist!";
    }
    
    if (normalizedQuestion.includes('celebration') || normalizedQuestion.includes('events')) {
      return "Our Events line includes Celebration Sparkle (green apple & elderflower), Wedding Rose (strawberry & rose petals), and Corporate Classic (berries & oak). Perfect for special occasions!";
    }
    
    if (normalizedQuestion.includes('ingredients') || normalizedQuestion.includes('kenyan')) {
      return "All our drinks use traditional Kenyan botanicals like hibiscus, tamarind, moringa, and baobab. We source ethically from local farmers to celebrate Kenya's rich heritage!";
    }
    
    if (normalizedQuestion.includes('price') || normalizedQuestion.includes('cost')) {
      return "For pricing information and to place orders, please contact us at hello@novino.co.ke or +254 712 345 678. We offer competitive rates for both individual bottles and bulk orders!";
    }
    
    // Default response
    return responses.default;
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
      chatInput.focus(); // Keep focus on input for continuous conversation
    }, Math.random() * 1000 + 1000); // Random delay between 1-2 seconds
  }

  // Function to ask predefined questions (from sample buttons)
  window.askQuestion = function(question) {
    chatInput.value = question;
    sendMessage();
  }

  // Event listeners
  sendBtn.addEventListener('click', sendMessage);
  
  chatInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      sendMessage();
    }
  });

  // Disable send button when input is empty
  chatInput.addEventListener('input', function() {
    sendBtn.disabled = this.value.trim() === '';
  });

  // Initialize with disabled send button
  sendBtn.disabled = true;
  
  // Focus on input when page loads
  chatInput.focus();
});
