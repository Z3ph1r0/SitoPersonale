document.addEventListener('DOMContentLoaded', function() {
    // Gestione navbar
    const navbar = document.getElementById('navbar');
    const navbarToggle = document.getElementById('navbarToggle');
    const navbarNav = document.getElementById('navbarNav');
    
    // Toggle menu su dispositivi mobili
    navbarToggle.addEventListener('click', function() {
        navbarNav.classList.toggle('show');
    });
    
    // Chiudi menu quando si clicca su un link
    const navLinks = document.querySelectorAll('.navbar-nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navbarNav.classList.remove('show');
        });
    });
    
    // Aggiorna classe active sul link corrente
    window.addEventListener('scroll', function() {
        let scrollPosition = window.scrollY + 100;
        
        document.querySelectorAll('.section').forEach(section => {
            let sectionTop = section.offsetTop;
            let sectionHeight = section.offsetHeight;
            let sectionId = section.getAttribute('id');
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                document.querySelectorAll('.navbar-nav a').forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === '#' + sectionId) {
                        link.classList.add('active');
                    }
                });
            }
        });
    });
    
    // Funzionalità carosello orizzontale
    function initCarousel() {
        const track = document.getElementById('carouselTrack');
        const slides = document.querySelectorAll('.carousel-slide');
        const indicators = document.querySelectorAll('.indicator');
        const prevBtn = document.getElementById('prevSlide');
        const nextBtn = document.getElementById('nextSlide');
        
        if (!track || slides.length === 0) return;
        
        let currentPosition = 0;
        const slideCount = slides.length;
        const visibleSlides = 3;
        const maxPosition = Math.ceil(slideCount / visibleSlides) - 1;
        
        // Update indicators to match the number of pages
        const indicatorContainer = document.querySelector('.carousel-indicators');
        if (indicatorContainer) {
            indicatorContainer.innerHTML = '';
            for (let i = 0; i <= maxPosition; i++) {
                const indicator = document.createElement('span');
                indicator.classList.add('indicator');
                if (i === 0) indicator.classList.add('active');
                indicator.setAttribute('data-slide', i);
                indicator.addEventListener('click', () => {
                    goToPosition(i);
                });
                indicatorContainer.appendChild(indicator);
            }
        }
        
        // Function to update carousel position
        function updateCarousel() {
            const slideWidth = 100 / visibleSlides;
            const offset = -currentPosition * visibleSlides * slideWidth;
            track.style.transform = `translateX(${offset}%)`;
            
            // Update indicators
            document.querySelectorAll('.indicator').forEach((ind, index) => {
                ind.classList.toggle('active', index === currentPosition);
            });
        }
        
        // Function to go to specific position
        function goToPosition(position) {
            currentPosition = Math.max(0, Math.min(position, maxPosition));
            updateCarousel();
        }
        
        // Event listener for previous button
        if (prevBtn) {
            prevBtn.addEventListener('click', function() {
                currentPosition = Math.max(0, currentPosition - 1);
                updateCarousel();
            });
        }
        
        // Event listener for next button
        if (nextBtn) {
            nextBtn.addEventListener('click', function() {
                currentPosition = Math.min(maxPosition, currentPosition + 1);
                updateCarousel();
            });
        }
        
        // Set up automatic rotation
        let autoplayInterval;
        
        function startAutoplay() {
            autoplayInterval = setInterval(function() {
                currentPosition = (currentPosition + 1) % (maxPosition + 1);
                updateCarousel();
            }, 5000);
        }
        
        function stopAutoplay() {
            clearInterval(autoplayInterval);
        }
        
        // Start autoplay
        startAutoplay();
        
        // Pause autoplay when hovering over carousel
        track.addEventListener('mouseenter', stopAutoplay);
        track.addEventListener('mouseleave', startAutoplay);
        
        // Initialize carousel
        updateCarousel();
        
        // Add touch support for mobile
        let touchStartX = 0;
        let touchEndX = 0;
        
        track.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        });
        
        track.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        });
        
        function handleSwipe() {
            const swipeThreshold = 50;
            if (touchEndX < touchStartX - swipeThreshold) {
                // Swipe left
                currentPosition = Math.min(maxPosition, currentPosition + 1);
                updateCarousel();
            } else if (touchEndX > touchStartX + swipeThreshold) {
                // Swipe right
                currentPosition = Math.max(0, currentPosition - 1);
                updateCarousel();
            }
        }
    }
    
    // Chiama la funzione per inizializzare il carosello
    initCarousel();
});