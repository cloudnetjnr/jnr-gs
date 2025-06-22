// Navbar Scroll Effect
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// System Requirements Tabs
const tabBtns = document.querySelectorAll('.tab-btn');

tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove active class from all buttons
        tabBtns.forEach(b => b.classList.remove('active'));
        
        // Add active class to clicked button
        btn.classList.add('active');
        
        // Get which tab to show
        const tabToShow = btn.getAttribute('data-tab');
        
        // Hide all requirements columns
        document.querySelectorAll('.requirements-table td').forEach(td => {
            td.style.display = 'none';
        });
        
        // Show the selected requirements
        document.querySelectorAll(`.${tabToShow}`).forEach(td => {
            td.style.display = 'table-cell';
        });
    });
});

// Back to Top Button
const backToTopBtn = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
        backToTopBtn.classList.add('active');
    } else {
        backToTopBtn.classList.remove('active');
    }
});

// Initialize animations when elements are in view
const animateOnScroll = () => {
    const elements = document.querySelectorAll('.game-card, .category-card, .feature-card');
    
    elements.forEach(element => {
        const elementPosition = element.getBoundingClientRect().top;
        const screenPosition = window.innerHeight / 1.2;
        
        if (elementPosition < screenPosition) {
            element.classList.add('animated');
        }
    });
};

window.addEventListener('scroll', animateOnScroll);
window.addEventListener('load', animateOnScroll);

// Hero Slider Functionality
document.addEventListener('DOMContentLoaded', function() {
    const slider = document.querySelector('.hero-slider');
    const slides = document.querySelectorAll('.hero-slide');
    const dotsContainer = document.querySelector('.slider-dots');
    const prevBtn = document.querySelector('.slider-prev');
    const nextBtn = document.querySelector('.slider-next');
    
    let currentSlide = 0;
    const slideCount = slides.length;
    
    // Create dots
    slides.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.classList.add('slider-dot');
        if (index === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(index));
        dotsContainer.appendChild(dot);
    });
    
    const dots = document.querySelectorAll('.slider-dot');
    
    // Auto slide change
    let slideInterval = setInterval(nextSlide, 5000);
    
    function goToSlide(slideIndex) {
        slides[currentSlide].classList.remove('active');
        dots[currentSlide].classList.remove('active');
        
        currentSlide = (slideIndex + slideCount) % slideCount;
        
        slides[currentSlide].classList.add('active');
        dots[currentSlide].classList.add('active');
        
        // Reset auto slide timer
        clearInterval(slideInterval);
        slideInterval = setInterval(nextSlide, 5000);
    }
    
    function nextSlide() {
        goToSlide(currentSlide + 1);
    }
    
    function prevSlide() {
        goToSlide(currentSlide - 1);
    }
    
    // Button events
    nextBtn.addEventListener('click', () => {
        nextSlide();
    });
    
    prevBtn.addEventListener('click', () => {
        prevSlide();
    });
    
    // Pause on hover
    slider.addEventListener('mouseenter', () => {
        clearInterval(slideInterval);
    });
    
    slider.addEventListener('mouseleave', () => {
        clearInterval(slideInterval);
        slideInterval = setInterval(nextSlide, 5000);
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') {
            nextSlide();
        } else if (e.key === 'ArrowLeft') {
            prevSlide();
        }
    });
});

// Trending Carousel Auto-Scroll
function setupTrendingCarousel() {
    const carousel = document.querySelector('.trending-carousel');
    const games = document.querySelectorAll('.trending-game');
    const prevBtn = document.querySelector('.trending-prev');
    const nextBtn = document.querySelector('.trending-next');
    
    let autoScrollInterval;
    const scrollAmount = 300; // Adjust based on game card width
    
    // Auto-scroll every 3 seconds
    function startAutoScroll() {
        autoScrollInterval = setInterval(() => {
            carousel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            
            // Reset to start if near end
            if (carousel.scrollLeft + carousel.clientWidth >= carousel.scrollWidth - 50) {
                setTimeout(() => {
                    carousel.scrollTo({ left: 0, behavior: 'smooth' });
                }, 1000);
            }
        }, 3000);
    }
    
    // Manual navigation
    nextBtn.addEventListener('click', () => {
        clearInterval(autoScrollInterval);
        carousel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        startAutoScroll();
    });
    
    prevBtn.addEventListener('click', () => {
        clearInterval(autoScrollInterval);
        carousel.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        startAutoScroll();
    });
    
    // Pause on hover
    carousel.addEventListener('mouseenter', () => {
        clearInterval(autoScrollInterval);
    });
    
    carousel.addEventListener('mouseleave', startAutoScroll);
    
    // Initialize
    startAutoScroll();
}

document.addEventListener('DOMContentLoaded', setupTrendingCarousel);

// Mobile Menu Toggle - Fixed Version
document.addEventListener('DOMContentLoaded', function() {
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    menuBtn.addEventListener('click', function() {
        navLinks.classList.toggle('active');
        menuBtn.classList.toggle('active');
    });
});

// Close menu when clicking overlay
navOverlay.addEventListener('click', () => {
    navLinks.classList.remove('active');
    navOverlay.classList.remove('active');
    body.classList.remove('no-scroll');
    mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
});

// Close menu when clicking a nav link
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        if (window.innerWidth <= 992) {
            navLinks.classList.remove('active');
            navOverlay.classList.remove('active');
            body.classList.remove('no-scroll');
            mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
        }
    });
});

// Close menu when window is resized above mobile breakpoint
window.addEventListener('resize', () => {
    if (window.innerWidth > 992 && navLinks.classList.contains('active')) {
        navLinks.classList.remove('active');
        navOverlay.classList.remove('active');
        body.classList.remove('no-scroll');
        mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
    }
});






 // Donation Ticker
 document.addEventListener('DOMContentLoaded', function() {
    // Create the social media container
    const socialContainer = document.createElement('div');
    socialContainer.className = 'social-media-links';
    socialContainer.style.position = 'fixed';
    socialContainer.style.bottom = '20px';
    socialContainer.style.left = '20px';
    socialContainer.style.zIndex = '1000';
    socialContainer.style.display = 'flex';
    socialContainer.style.flexDirection = 'column';
    socialContainer.style.gap = '12px';
    socialContainer.style.alignItems = 'flex-start';
    socialContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
    socialContainer.style.padding = '12px';
    socialContainer.style.borderRadius = '10px';
    socialContainer.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';

    // WhatsApp link (using Simple Icons CDN)
    const whatsappLink = document.createElement('a');
    whatsappLink.href = 'https://chat.whatsapp.com/JBIyrm7GC7wDgVrVmwbcUa'; // Replace with your WhatsApp link
    whatsappLink.target = '_blank';
    whatsappLink.rel = 'noopener noreferrer';
    whatsappLink.innerHTML = `
        <img src="https://img.icons8.com/?size=100&id=d5ntEsf0JRhM&format=png&color=000000" alt="WhatsApp" width="24" height="24">
        <span style="margin-left: 8px;">WhatsApp</span>
    `;
    whatsappLink.style.display = 'flex';
    whatsappLink.style.alignItems = 'center';
    whatsappLink.style.textDecoration = 'none';
    whatsappLink.style.color = '#25D366'; // WhatsApp brand color
    whatsappLink.style.fontWeight = '500';

    // Telegram link (using Simple Icons CDN)
    const telegramLink = document.createElement('a');
    telegramLink.href = 'https://t.me/jnrgamesstore'; // Replace with your Telegram
    telegramLink.target = '_blank';
    telegramLink.rel = 'noopener noreferrer';
    telegramLink.innerHTML = `
        <img src="https://img.icons8.com/?size=100&id=MIMjVKoXINIT&format=png&color=000000" alt="Telegram" width="24" height="24">
        <span style="margin-left: 8px;">Telegram</span>
    `;
    telegramLink.style.display = 'flex';
    telegramLink.style.alignItems = 'center';
    telegramLink.style.textDecoration = 'none';
    telegramLink.style.color = '#0088CC'; // Telegram brand color
    telegramLink.style.fontWeight = '500';

    // Discord link (using Simple Icons CDN)
    const discordLink = document.createElement('a');
    discordLink.href = 'https://discord.gg/AwgQm5vV'; // Replace with your Discord
    discordLink.target = '_blank';
    discordLink.rel = 'noopener noreferrer';
    discordLink.innerHTML = `
        <img src="https://img.icons8.com/?size=100&id=M725CLW4L7wE&format=png&color=000000" alt="Discord" width="24" height="24">
        <span style="margin-left: 8px;">Discord</span>
    `;
    discordLink.style.display = 'flex';
    discordLink.style.alignItems = 'center';
    discordLink.style.textDecoration = 'none';
    discordLink.style.color = '#5865F2'; // Discord brand color
    discordLink.style.fontWeight = '500';

    // Add hover effects
    [whatsappLink, telegramLink, discordLink].forEach(link => {
        link.style.transition = 'transform 0.2s';
        link.onmouseenter = () => link.style.transform = 'scale(1.05)';
        link.onmouseleave = () => link.style.transform = 'scale(1)';
    });

    // Add links to container
    socialContainer.appendChild(whatsappLink);
    socialContainer.appendChild(telegramLink);
    socialContainer.appendChild(discordLink);

    // Add container to body
    document.body.appendChild(socialContainer);
});






// Create and inject the loader HTML and CSS
function createLoader() {
    // Create style element with all CSS
    const style = document.createElement('style');
    style.innerHTML = `
      .loader-wrapper {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: #0a0a1a;
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
        transition: opacity 0.5s ease;
      }
      
      .loader {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 20px;
        width: 100%;
        max-width: 300px;
      }
      
      .loader-logo img {
        width: 100px;
        height: auto;
        animation: pulse 1.5s infinite ease-in-out;
      }
      
      .loader-bar {
        width: 100%;
        height: 4px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 2px;
        overflow: hidden;
      }
      
      .loader-progress {
        height: 100%;
        width: 0%;
        background: linear-gradient(90deg, #ff4d4d, #f9cb28);
        border-radius: 2px;
        transition: width 0.3s ease;
      }
      
      .loader-text {
        color: #fff;
        font-family: 'Poppins', sans-serif;
        font-size: 14px;
        text-transform: uppercase;
        letter-spacing: 2px;
      }
      
      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); }
      }
    `;
    
    // Create loader HTML structure
    const loaderHTML = `
      <div class="loader">
        <div class="loader-logo">
          <img src="/Games/images/jnr gs logo.png" alt="JNR Games Store">
        </div>
        <div class="loader-bar">
          <div class="loader-progress"></div>
        </div>
        <div class="loader-text">Loading...</div>
      </div>
    `;
    
    // Create loader wrapper and append everything
    const loaderWrapper = document.createElement('div');
    loaderWrapper.className = 'loader-wrapper';
    loaderWrapper.innerHTML = loaderHTML;
    
    // Add to document
    document.body.prepend(loaderWrapper);
    document.head.appendChild(style);
  }
  
  // Initialize the loader
  document.addEventListener('DOMContentLoaded', function() {
    createLoader();
    
    const loaderWrapper = document.querySelector('.loader-wrapper');
    const loaderProgress = document.querySelector('.loader-progress');
    
    // Simulate loading progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 10;
      if (progress > 100) progress = 100;
      loaderProgress.style.width = progress + '%';
      
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          loaderWrapper.style.opacity = '0';
          setTimeout(() => {
            loaderWrapper.remove();
          }, 500);
        }, 300);
      }
    }, 100);
    
    // Ensure loader hides even if there's an error
    window.addEventListener('load', function() {
      if (progress < 100) {
        progress = 100;
        loaderProgress.style.width = '100%';
        setTimeout(() => {
          loaderWrapper.style.opacity = '0';
          setTimeout(() => {
            loaderWrapper.remove();
          }, 500);
        }, 300);
      }
    });
  });