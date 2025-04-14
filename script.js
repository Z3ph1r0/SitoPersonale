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
        const visibleSlides = window.innerWidth < 576 ? 1 : window.innerWidth < 992 ? 2 : 3;
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
        
        // Aggiorna il carosello quando la finestra viene ridimensionata
        window.addEventListener('resize', function() {
            const newVisibleSlides = window.innerWidth < 576 ? 1 : window.innerWidth < 992 ? 2 : 3;
            if (newVisibleSlides !== visibleSlides) {
                location.reload(); // Ricaricare la pagina è più semplice che ricalcolare tutto
            }
        });
    }
    
    // Chiama la funzione per inizializzare il carosello
    initCarousel();
    
    // Crea il modal per le immagini
    let imageModal = document.getElementById('imageModal');
    if (!imageModal) {
        // Crea il modal e lo aggiunge al body
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
    
    // Riferimenti agli elementi del modal
    const modalImg = document.getElementById('modalImage');
    const modalCaption = document.getElementById('modalCaption');
    const closeModalBtn = document.querySelector('.close-modal');
    
    // Funzione per chiudere il modal
    function closeImageModal() {
        imageModal.classList.remove('show');
        setTimeout(() => {
            imageModal.style.display = 'none';
        }, 300);
        
        // Ripristina lo scroll della pagina
        document.body.style.overflow = '';
    }
    
    // Chiudi il modal quando si fa clic sulla X
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeImageModal);
    }
    
    // Chiudi il modal quando si fa clic al di fuori dell'immagine
    imageModal.addEventListener('click', function(event) {
        if (event.target === imageModal) {
            closeImageModal();
        }
    });
    
    // Chiudi il modal con il tasto ESC
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && imageModal.classList.contains('show')) {
            closeImageModal();
        }
    });
    
    // Gestisci i click sulle immagini nella sezione servizi
    const servizioImmagini = document.querySelectorAll('.servizio-immagine');
    servizioImmagini.forEach(function(servizioItem) {
        // Aggiungi il cursore pointer per indicare che è cliccabile
        servizioItem.style.cursor = 'pointer';
        
        // Aggiungi l'evento click
        servizioItem.addEventListener('click', function() {
            // Ottieni l'URL dell'immagine dalla sorgente dell'immagine o dall'attributo data-img
            const imgSrc = this.getAttribute('data-img') || this.querySelector('img').src;
            
            // Ottieni il titolo e la descrizione dall'overlay
            const overlay = this.querySelector('.servizio-overlay');
            let title = '';
            let desc = '';
            
            if (overlay) {
                const titleElement = overlay.querySelector('h3');
                const descElement = overlay.querySelector('p');
                
                if (titleElement) title = titleElement.textContent;
                if (descElement) desc = descElement.textContent;
            }
            
            // Imposta i valori nel modal
            modalImg.src = imgSrc;
            modalCaption.innerHTML = title ? `<h3>${title}</h3>` : '';
            if (desc) {
                modalCaption.innerHTML += `<p>${desc}</p>`;
            }
            
            // Mostra il modal con animazione
            imageModal.style.display = 'flex';
            setTimeout(() => {
                imageModal.classList.add('show');
            }, 10);
            
            // Blocca lo scroll della pagina
            document.body.style.overflow = 'hidden';
        });
    });
    
    // Gestisci anche i click sulle immagini nel carosello portfolio
    const portfolioImmagini = document.querySelectorAll('.carousel-slide');
    portfolioImmagini.forEach(function(slide) {
        const img = slide.querySelector('img');
        const caption = slide.querySelector('.carousel-caption');
        
        if (img) {
            // Aggiungi il cursore pointer
            img.style.cursor = 'pointer';
            
            img.addEventListener('click', function(e) {
                e.stopPropagation(); // Impedisce che l'evento si propaghi al carosello
                
                // Ottieni l'URL dell'immagine
                const imgSrc = this.src;
                
                // Prepara il contenuto del caption
                let captionHTML = '';
                if (caption) {
                    const titleElement = caption.querySelector('h3');
                    const descElement = caption.querySelector('p');
                    
                    if (titleElement) captionHTML += `<h3>${titleElement.textContent}</h3>`;
                    if (descElement) captionHTML += `<p>${descElement.textContent}</p>`;
                }
                
                // Imposta i valori nel modal
                modalImg.src = imgSrc;
                modalCaption.innerHTML = captionHTML;
                
                // Mostra il modal con animazione
                imageModal.style.display = 'flex';
                setTimeout(() => {
                    imageModal.classList.add('show');
                }, 10);
                
                // Blocca lo scroll della pagina
                document.body.style.overflow = 'hidden';
            });
        }
    });
    
    // Gestione del form di contatto
    const callForm = document.getElementById('callForm');
    if (callForm) {
        callForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Qui puoi aggiungere la logica per inviare i dati del form
            // Ad esempio, usando fetch per inviare i dati a un server
            
            // Per ora mostreremo solo un alert di conferma
            alert('Grazie per aver inviato la richiesta! Ti contatteremo presto.');
            this.reset();
        });
    }
// Gestione del pulsante contatti fisso
document.addEventListener('DOMContentLoaded', function() {
    const contactButton = document.getElementById('contactButton');
    
    if (contactButton) {
        contactButton.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetSection = document.getElementById('section5');
            if (targetSection) {
                // Scroll fluido alla sezione contatti
                targetSection.scrollIntoView({ behavior: 'smooth' });
                
                // Focus sul primo campo del form dopo lo scroll
                setTimeout(function() {
                    const nameInput = document.getElementById('name');
                    if (nameInput) nameInput.focus();
                }, 1000);
            }
        });
    }
});
});