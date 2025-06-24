document.addEventListener('DOMContentLoaded', function() {
    // ==========================================================================
    // GESTIONE NAVBAR
    // ==========================================================================
    const navbar = document.getElementById('navbar');
    const navbarToggle = document.getElementById('navbarToggle');
    const navbarNav = document.getElementById('navbarNav');
    
    // Toggle menu su dispositivi mobili
    if (navbarToggle && navbarNav) {
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
    }
    
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
    
    // ==========================================================================
    // CAROSELLO CON LOOP INFINITO E SWIPE
    // ==========================================================================
    function initCarousel() {
        const track = document.getElementById('carouselTrack');
        const slides = document.querySelectorAll('.carousel-slide');
        const prevBtn = document.getElementById('prevSlide');
        const nextBtn = document.getElementById('nextSlide');
        
        if (!track || slides.length === 0) return;
        
        let currentSlide = 0;
        const totalSlides = slides.length;
        const visibleSlides = getVisibleSlides();
        let isTransitioning = false;
        
        function getVisibleSlides() {
            if (window.innerWidth < 576) return 1;
            if (window.innerWidth < 992) return 2;
            return 3;
        }
        
        // Crea e aggiorna gli indicatori
        function updateIndicators() {
            const indicatorContainer = document.querySelector('.carousel-indicators');
            if (!indicatorContainer) return;
            
            indicatorContainer.innerHTML = '';
            for (let i = 0; i < totalSlides; i++) {
                const indicator = document.createElement('span');
                indicator.classList.add('indicator');
                if (i === currentSlide) indicator.classList.add('active');
                indicator.setAttribute('data-slide', i);
                indicator.addEventListener('click', () => {
                    if (!isTransitioning) {
                        goToSlide(i);
                    }
                });
                indicatorContainer.appendChild(indicator);
            }
        }
        
        // Aggiorna la posizione del carosello
        function updateCarousel() {
            if (isTransitioning) return;
            
            isTransitioning = true;
            const slideWidth = 100 / visibleSlides;
            const offset = -currentSlide * slideWidth;
            
            track.style.transition = 'transform 0.5s ease';
            track.style.transform = `translateX(${offset}%)`;
            
            // Aggiorna indicatori
            document.querySelectorAll('.indicator').forEach((ind, index) => {
                ind.classList.toggle('active', index === currentSlide);
            });
            
            setTimeout(() => {
                isTransitioning = false;
            }, 500);
        }
        
        // Vai a una slide specifica
        function goToSlide(slideIndex) {
            currentSlide = slideIndex;
            updateCarousel();
        }
        
        // Slide successiva con loop infinito
        function nextSlide() {
            if (isTransitioning) return;
            currentSlide = (currentSlide + 1) % totalSlides;
            updateCarousel();
        }
        
        // Slide precedente con loop infinito
        function prevSlide() {
            if (isTransitioning) return;
            currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
            updateCarousel();
        }
        
        // Event listeners per i pulsanti
        if (prevBtn) {
            prevBtn.addEventListener('click', prevSlide);
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', nextSlide);
        }
        
        // ==========================================================================
        // SUPPORTO TOUCH E SWIPE
        // ==========================================================================
        let touchStartX = 0;
        let touchEndX = 0;
        let touchStartY = 0;
        let touchEndY = 0;
        
        track.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
        }, { passive: true });
        
        track.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            touchEndY = e.changedTouches[0].screenY;
            handleSwipe();
        }, { passive: true });
        
        function handleSwipe() {
            const swipeThreshold = 50;
            const swipeDistanceX = Math.abs(touchEndX - touchStartX);
            const swipeDistanceY = Math.abs(touchEndY - touchStartY);
            
            // Verifica che lo swipe sia più orizzontale che verticale
            if (swipeDistanceX > swipeThreshold && swipeDistanceX > swipeDistanceY) {
                if (touchEndX < touchStartX) {
                    // Swipe left - vai avanti
                    nextSlide();
                } else {
                    // Swipe right - vai indietro
                    prevSlide();
                }
            }
        }
        
        // ==========================================================================
        // AUTOPLAY
        // ==========================================================================
        let autoplayInterval;
        
        function startAutoplay() {
            autoplayInterval = setInterval(nextSlide, 4000);
        }
        
        function stopAutoplay() {
            clearInterval(autoplayInterval);
        }
        
        // Pausa autoplay su hover
        const carouselContainer = document.querySelector('.portfolio-carousel');
        if (carouselContainer) {
            carouselContainer.addEventListener('mouseenter', stopAutoplay);
            carouselContainer.addEventListener('mouseleave', startAutoplay);
        }
        
        // Pausa autoplay durante il touch
        track.addEventListener('touchstart', stopAutoplay);
        track.addEventListener('touchend', () => {
            setTimeout(startAutoplay, 2000); // Riprendi dopo 2 secondi
        });
        
        // Inizializza tutto
        updateIndicators();
        updateCarousel();
        startAutoplay();
        
        // Gestione resize
        window.addEventListener('resize', function() {
            const newVisibleSlides = getVisibleSlides();
            if (newVisibleSlides !== visibleSlides) {
                // Ricalcola la posizione corrente
                if (currentSlide >= totalSlides) {
                    currentSlide = 0;
                }
                updateCarousel();
            }
        });
    }
    
    // ==========================================================================
    // MODAL PER IMMAGINI
    // ==========================================================================
    let imageModal = document.getElementById('imageModal');
    if (!imageModal) {
        imageModal = document.createElement('div');
        imageModal.id = 'imageModal';
        imageModal.className = 'modal';
        imageModal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <img id="modalImage" src="" alt="Immagine ingrandita">
                <div id="modalCaption" class="modal-caption"></div>
            </div>
        `;
        document.body.appendChild(imageModal);
    }
    
    const modalImg = document.getElementById('modalImage');
    const modalCaption = document.getElementById('modalCaption');
    const closeModalBtn = document.querySelector('.close-modal');
    
    function openModal(imgSrc, title = '', description = '') {
        modalImg.src = imgSrc;
        modalCaption.innerHTML = '';
        
        if (title) {
            modalCaption.innerHTML += `<h3>${title}</h3>`;
        }
        if (description) {
            modalCaption.innerHTML += `<p>${description}</p>`;
        }
        
        imageModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        setTimeout(() => {
            imageModal.classList.add('show');
        }, 10);
    }
    
    function closeModal() {
        imageModal.classList.remove('show');
        document.body.style.overflow = '';
        
        setTimeout(() => {
            imageModal.style.display = 'none';
        }, 300);
    }
    
    // Event listeners per chiudere il modal
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeModal);
    }
    
    imageModal.addEventListener('click', function(event) {
        if (event.target === imageModal) {
            closeModal();
        }
    });
    
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && imageModal.classList.contains('show')) {
            closeModal();
        }
    });
    
    // ==========================================================================
    // CLICK SULLE IMMAGINI DEI SERVIZI
    // ==========================================================================
    const servizioImmagini = document.querySelectorAll('.servizio-immagine');
    servizioImmagini.forEach(function(servizioItem) {
        servizioItem.style.cursor = 'pointer';
        
        servizioItem.addEventListener('click', function() {
            const img = this.querySelector('img');
            const overlay = this.querySelector('.servizio-overlay');
            
            let imgSrc = '';
            let title = '';
            let desc = '';
            
            if (img) {
                imgSrc = img.src;
            }
            
            if (overlay) {
                const titleElement = overlay.querySelector('h3');
                const descElement = overlay.querySelector('p');
                
                if (titleElement) title = titleElement.textContent;
                if (descElement) desc = descElement.textContent;
            }
            
            if (imgSrc) {
                openModal(imgSrc, title, desc);
            }
        });
    });
    
    // ==========================================================================
    // CLICK SULLE IMMAGINI DEL CAROSELLO
    // ==========================================================================
    const portfolioImmagini = document.querySelectorAll('.carousel-slide img');
    portfolioImmagini.forEach(function(img) {
        img.style.cursor = 'pointer';
        
        img.addEventListener('click', function(e) {
            e.stopPropagation();
            
            const slide = this.closest('.carousel-slide');
            const caption = slide ? slide.querySelector('.carousel-caption') : null;
            
            let title = '';
            let desc = '';
            
            if (caption) {
                const titleElement = caption.querySelector('h3');
                const descElement = caption.querySelector('p');
                
                if (titleElement) title = titleElement.textContent;
                if (descElement) desc = descElement.textContent;
            }
            
            openModal(this.src, title, desc);
        });
    });
    
    // ==========================================================================
    // GESTIONE FORM DI CONTATTO
    // ==========================================================================
    const callForm = document.getElementById('callForm');
    if (callForm) {
        callForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validazione base
            const requiredFields = this.querySelectorAll('[required]');
            let isValid = true;
            
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    field.style.borderColor = '#ff0000';
                } else {
                    field.style.borderColor = '#ddd';
                }
            });
            
            if (isValid) {
                alert('Grazie per aver inviato la richiesta! Ti contatteremo presto.');
                this.reset();
            } else {
                alert('Per favore, compila tutti i campi obbligatori.');
            }
        });
    }
    
    // ==========================================================================
    // PULSANTE CONTATTI FISSO
    // ==========================================================================
    const contactButton = document.getElementById('contactButton');
    if (contactButton) {
        contactButton.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetSection = document.getElementById('section5');
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth' });
                
                setTimeout(function() {
                    const nameInput = document.getElementById('name');
                    if (nameInput) nameInput.focus();
                }, 1000);
            }
        });
    }
    
    // Inizializza il carosello
    initCarousel();
});