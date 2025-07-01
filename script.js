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
    
    // Burger menu functionality (se presente)
    const burgerMenu = document.getElementById('burgerMenu');
    const navMenu = document.getElementById('navMenu');

    if (burgerMenu && navMenu) {
        burgerMenu.addEventListener('click', () => {
            burgerMenu.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Chiudi menu quando clicchi su una voce
        const navLinks = document.querySelectorAll('.nav-btn');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                burgerMenu.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });

        // Chiudi menu quando clicchi fuori
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.floating-nav')) {
                burgerMenu.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    }

    // ==========================================================================
    // CAROSELLO PORTFOLIO CON LOOP INFINITO - VERSIONE CORRETTA
    // ==========================================================================

    class PortfolioCarousel {
        constructor(containerId, images) {
            // Elementi DOM
            this.container = document.getElementById(containerId);
            if (!this.container) {
                console.error('Container del carosello non trovato:', containerId);
                return;
            }
            
            this.track = this.container.querySelector('.carousel-track');
            this.indicators = this.container.querySelector('.carousel-indicators');
            
            // CORREZIONE: Selettori multipli per i bottoni
            this.prevBtn = this.container.querySelector('.carousel-control[onclick*="prev"]') || 
                          this.container.querySelector('[data-direction="prev"]') ||
                          this.container.querySelector('.carousel-prev') ||
                          document.querySelector('#prev-btn');
                          
            this.nextBtn = this.container.querySelector('.carousel-control[onclick*="next"]') || 
                          this.container.querySelector('[data-direction="next"]') ||
                          this.container.querySelector('.carousel-next') ||
                          document.querySelector('#next-btn');
            
            // Debug: verifica se i bottoni sono stati trovati
            console.log('Bottoni trovati:', {
                prev: !!this.prevBtn,
                next: !!this.nextBtn,
                prevElement: this.prevBtn,
                nextElement: this.nextBtn
            });
            
            this.autoplayToggle = document.getElementById('autoplay-toggle');
            this.autoplayStatus = document.querySelector('.autoplay-status');
            
            // Configurazione
            this.images = images;
            this.currentIndex = 0;
            this.slidesPerView = this.getSlidesPerView();
            this.totalSlides = this.images.length;
            this.autoplayInterval = null;
            this.isAutoplay = true;
            this.transitionDuration = 400;
            this.autoplayDelay = 4000;
            
            // Inizializzazione
            this.init();
        }

        // Calcola quante slide mostrare in base alla larghezza schermo
        getSlidesPerView() {
            if (window.innerWidth <= 576) return 1;
            if (window.innerWidth <= 992) return 2;
            return 3;
        }

        // Inizializza il carosello
        init() {
            if (!this.track || this.images.length === 0) {
                console.error('Carosello: elementi DOM o immagini mancanti');
                return;
            }

            this.createSlides();
            this.createIndicators();
            this.attachEventListeners();
            this.updateCarousel();
            this.startAutoplay();
        }

        // Avvia autoplay
        startAutoplay() {
            if (!this.isAutoplay) return;
            
            this.stopAutoplay(); // Pulisci eventuali interval esistenti
            
            this.autoplayInterval = setInterval(() => {
                this.next();
            }, this.autoplayDelay);
            
            this.updateAutoplayUI();
        }

        // Crea le slide (originali + cloni per loop infinito)
        createSlides() {
            this.track.innerHTML = '';
            
            const slidesToPrepend = this.slidesPerView;
            const slidesToAppend = this.slidesPerView;
            
            // Cloni iniziali (ultime immagini)
            for (let i = this.totalSlides - slidesToPrepend; i < this.totalSlides; i++) {
                this.createSlide(this.images[i], true);
            }
            
            // Slide originali
            this.images.forEach((image, index) => {
                this.createSlide(image, false, index);
            });
            
            // Cloni finali (prime immagini)
            for (let i = 0; i < slidesToAppend; i++) {
                this.createSlide(this.images[i], true);
            }

            // Posizione iniziale (dopo i cloni iniziali)
            this.currentIndex = slidesToPrepend;
            this.updateTrackPosition(false);
        }

        // Crea una singola slide
        createSlide(imageData, isClone = false, originalIndex = null) {
            const slide = document.createElement('div');
            slide.className = `carousel-slide${isClone ? ' clone' : ''}`;
            
            if (originalIndex !== null) {
                slide.dataset.originalIndex = originalIndex;
            }
            
            slide.innerHTML = `
                <img src="${imageData.src}" alt="${imageData.title}" class="carousel-image" loading="lazy">
                <div class="carousel-caption">
                    <h4>${imageData.title}</h4>
                    <p>${imageData.description}</p>
                </div>
            `;
            
            this.track.appendChild(slide);
        }

        // Crea gli indicatori
        createIndicators() {
            if (!this.indicators) return;
            
            this.indicators.innerHTML = '';
            
            for (let i = 0; i < this.totalSlides; i++) {
                const indicator = document.createElement('div');
                indicator.className = 'indicator';
                indicator.dataset.index = i;
                indicator.addEventListener('click', () => this.goToSlide(i));
                this.indicators.appendChild(indicator);
            }
        }

        // Aggiorna la posizione del track
        updateTrackPosition(animate = true) {
            const translateX = -(this.currentIndex * (100 / this.slidesPerView));
            
            if (animate) {
                this.track.classList.remove('no-transition');
            } else {
                this.track.classList.add('no-transition');
            }
            
            this.track.style.transform = `translateX(${translateX}%)`;
            
            // Rimuovi la classe no-transition dopo un frame
            if (!animate) {
                requestAnimationFrame(() => {
                    this.track.classList.remove('no-transition');
                });
            }
        }

        // Aggiorna gli indicatori
        updateIndicators() {
            if (!this.indicators) return;
            
            const indicators = this.indicators.querySelectorAll('.indicator');
            const realIndex = this.getRealIndex();
            
            indicators.forEach((indicator, index) => {
                indicator.classList.toggle('active', index === realIndex);
            });
        }

        // Ottieni l'indice reale (senza contare i cloni)
        getRealIndex() {
            const slidesToPrepend = this.slidesPerView;
            return (this.currentIndex - slidesToPrepend + this.totalSlides) % this.totalSlides;
        }

        // Aggiorna tutto il carosello
        updateCarousel() {
            this.updateTrackPosition();
            this.updateIndicators();
        }

        // Vai alla slide successiva
        next() {
            this.currentIndex++;
            this.updateCarousel();
            
            // Controlla se dobbiamo fare il reset per il loop infinito
            setTimeout(() => {
                const maxIndex = this.totalSlides + this.slidesPerView;
                if (this.currentIndex >= maxIndex) {
                    this.currentIndex = this.slidesPerView;
                    this.updateTrackPosition(false);
                }
            }, this.transitionDuration);
        }

        // Vai alla slide precedente
        prev() {
            this.currentIndex--;
            this.updateCarousel();
            
            // Controlla se dobbiamo fare il reset per il loop infinito
            setTimeout(() => {
                if (this.currentIndex < this.slidesPerView) {
                    this.currentIndex = this.totalSlides + this.slidesPerView - 1;
                    this.updateTrackPosition(false);
                }
            }, this.transitionDuration);
        }

        // Vai a una slide specifica
        goToSlide(index) {
            const slidesToPrepend = this.slidesPerView;
            this.currentIndex = index + slidesToPrepend;
            this.updateCarousel();
        }

        // Ferma autoplay
        stopAutoplay() {
            if (this.autoplayInterval) {
                clearInterval(this.autoplayInterval);
                this.autoplayInterval = null;
            }
        }

        // Toggle autoplay
        toggleAutoplay() {
            this.isAutoplay = !this.isAutoplay;
            
            if (this.isAutoplay) {
                this.startAutoplay();
            } else {
                this.stopAutoplay();
            }
            
            this.updateAutoplayUI();
        }

        // Aggiorna UI autoplay
        updateAutoplayUI() {
            if (this.autoplayToggle) {
                this.autoplayToggle.innerHTML = this.isAutoplay ? '⏸️ Pausa' : '▶️ Play';
            }
            
            if (this.autoplayStatus) {
                this.autoplayStatus.textContent = this.isAutoplay ? 
                    `Autoplay attivo - Cambia ogni ${this.autoplayDelay/1000}s` : 
                    'Autoplay disattivato';
            }
        }

        // Gestisci resize
        handleResize() {
            const newSlidesPerView = this.getSlidesPerView();
            
            if (newSlidesPerView !== this.slidesPerView) {
                this.slidesPerView = newSlidesPerView;
                const realIndex = this.getRealIndex();
                this.createSlides();
                this.goToSlide(realIndex);
            }
        }

        // Aggiungi event listeners
        attachEventListeners() {
            // Controlli navigazione - CORREZIONE
            if (this.nextBtn) {
                // Rimuovi eventuali onclick inline
                this.nextBtn.removeAttribute('onclick');
                this.nextBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Click su next button');
                    this.handleUserInteraction(() => this.next());
                });
                console.log('Event listener aggiunto al bottone next');
            } else {
                console.warn('Bottone next non trovato');
            }

            if (this.prevBtn) {
                // Rimuovi eventuali onclick inline
                this.prevBtn.removeAttribute('onclick');
                this.prevBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Click su prev button');
                    this.handleUserInteraction(() => this.prev());
                });
                console.log('Event listener aggiunto al bottone prev');
            } else {
                console.warn('Bottone prev non trovato');
            }

            // Toggle autoplay
            if (this.autoplayToggle) {
                this.autoplayToggle.addEventListener('click', () => {
                    this.toggleAutoplay();
                });
            }

            // Pausa su hover
            this.container.addEventListener('mouseenter', () => {
                if (this.isAutoplay) this.stopAutoplay();
            });

            this.container.addEventListener('mouseleave', () => {
                if (this.isAutoplay) this.startAutoplay();
            });

            // Resize
            window.addEventListener('resize', () => {
                clearTimeout(this.resizeTimeout);
                this.resizeTimeout = setTimeout(() => {
                    this.handleResize();
                }, 250);
            });

            // Touch/swipe support
            this.addTouchSupport();

            // Keyboard support
            this.addKeyboardSupport();
        }

        // Gestisci interazione utente (pausa temporanea autoplay)
        handleUserInteraction(callback) {
            const wasAutoplay = this.isAutoplay;
            this.stopAutoplay();
            callback();
            
            if (wasAutoplay) {
                setTimeout(() => {
                    if (this.isAutoplay) this.startAutoplay();
                }, 3000); // Riprende dopo 3 secondi
            }
        }

        // Aggiungi supporto touch/swipe
        addTouchSupport() {
            let startX = 0;
            let isDragging = false;
            let startTime = 0;

            this.track.addEventListener('touchstart', (e) => {
                startX = e.touches[0].clientX;
                startTime = Date.now();
                isDragging = true;
                this.stopAutoplay();
            }, { passive: true });

            this.track.addEventListener('touchmove', (e) => {
                if (!isDragging) return;
                // Previeni scroll verticale solo se swipe orizzontale
                const currentX = e.touches[0].clientX;
                const diffX = Math.abs(startX - currentX);
                if (diffX > 10) {
                    e.preventDefault();
                }
            }, { passive: false });

            this.track.addEventListener('touchend', (e) => {
                if (!isDragging) return;
                
                const endX = e.changedTouches[0].clientX;
                const diffX = startX - endX;
                const diffTime = Date.now() - startTime;
                
                // Swipe deve essere abbastanza veloce e lungo
                if (Math.abs(diffX) > 50 && diffTime < 300) {
                    if (diffX > 0) {
                        this.next();
                    } else {
                        this.prev();
                    }
                }
                
                isDragging = false;
                
                // Riprende autoplay dopo interazione
                if (this.isAutoplay) {
                    setTimeout(() => this.startAutoplay(), 2000);
                }
            }, { passive: true });
        }

        // Aggiungi supporto keyboard
        addKeyboardSupport() {
            document.addEventListener('keydown', (e) => {
                // Solo se il carosello è visibile
                if (!this.container.offsetParent) return;
                
                switch(e.key) {
                    case 'ArrowLeft':
                        e.preventDefault();
                        this.handleUserInteraction(() => this.prev());
                        break;
                    case 'ArrowRight':
                        e.preventDefault();
                        this.handleUserInteraction(() => this.next());
                        break;
                    case ' ': // Spacebar
                        e.preventDefault();
                        this.toggleAutoplay();
                        break;
                }
            });
        }

        // Distruggi il carosello (cleanup)
        destroy() {
            this.stopAutoplay();
            if (this.resizeTimeout) clearTimeout(this.resizeTimeout);
            // Rimuovi event listeners se necessario
        }
    }

    // ==========================================================================
    // INIZIALIZZAZIONE CAROSELLO
    // ==========================================================================

    // Dati delle immagini del portfolio
    const portfolioImages = [
        { 
            src: 'Tarocchi/1.png', 
            title: 'Tarocco del Matto', 
            description: 'Carta ispirata al videogioco Dark Souls 1' 
        },
        { 
            src: 'Tarocchi/2.png', 
            title: 'Tarocco della Papessa', 
            description: 'Carta ispirata al videogioco Dark Souls 3' 
        },
        { 
            src: 'Tarocchi/3.png', 
            title: 'Tarocco dell\' Imperatore', 
            description: 'Carta ispirata al videogioco Dark Souls 1' 
        },
        { 
            src: 'Tarocchi/4.png', 
            title: 'Tarocco degli Amanti', 
            description: 'Carta ispirata al videogioco Dark Souls 3' 
        },
        { 
            src: 'Tarocchi/5.png', 
            title: 'Tarocco del Carro', 
            description: 'Carta ispirata al videogioco Dark Souls 3' 
        },
        { 
            src: 'Tarocchi/6.png', 
            title: 'Tarocco del Sole', 
            description: 'Carta ispirata al videogioco Dark Souls 1' 
        }
    ];

    // Inizializza il carosello quando il DOM è pronto
    const carouselContainer = document.querySelector('.portfolio-carousel-container');
    
    if (carouselContainer && portfolioImages.length > 0) {
        // Assegna un ID se non ce l'ha
        if (!carouselContainer.id) {
            carouselContainer.id = 'portfolio-carousel-container';
        }
        
        // Crea il carosello
        window.portfolioCarousel = new PortfolioCarousel(carouselContainer.id, portfolioImages);
        
        console.log('Carosello portfolio inizializzato con', portfolioImages.length, 'immagini');
    } else {
        console.warn('Carosello: container non trovato o nessuna immagine disponibile');
    }

    // ==========================================================================
    // FALLBACK PER BOTTONI CAROSELLO - FUNZIONI GLOBALI
    // ==========================================================================
    
    // Funzioni globali per i bottoni (caso in cui abbiano onclick inline nell'HTML)
    window.prevSlide = function() {
        console.log('Funzione prevSlide chiamata');
        if (window.portfolioCarousel) {
            window.portfolioCarousel.prev();
        }
    };
    
    window.nextSlide = function() {
        console.log('Funzione nextSlide chiamata');
        if (window.portfolioCarousel) {
            window.portfolioCarousel.next();
        }
    };

    // Alternativa: cerca i bottoni con classi generiche
    setTimeout(() => {
        const allPrevButtons = document.querySelectorAll('button:not([data-carousel-handled])');
        const allNextButtons = document.querySelectorAll('button:not([data-carousel-handled])');
        
        allPrevButtons.forEach(btn => {
            const btnText = btn.textContent.toLowerCase();
            const btnHTML = btn.innerHTML.toLowerCase();
            
            if (btnText.includes('prev') || btnText.includes('◀') || 
                btnHTML.includes('left') || btnHTML.includes('prev') ||
                btn.classList.contains('carousel-prev')) {
                
                btn.dataset.carouselHandled = 'true';
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    console.log('Bottone prev generico cliccato');
                    if (window.portfolioCarousel) {
                        window.portfolioCarousel.prev();
                    }
                });
            }
        });
        
        allNextButtons.forEach(btn => {
            const btnText = btn.textContent.toLowerCase();
            const btnHTML = btn.innerHTML.toLowerCase();
            
            if (btnText.includes('next') || btnText.includes('▶') || 
                btnHTML.includes('right') || btnHTML.includes('next') ||
                btn.classList.contains('carousel-next')) {
                
                btn.dataset.carouselHandled = 'true';
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    console.log('Bottone next generico cliccato');
                    if (window.portfolioCarousel) {
                        window.portfolioCarousel.next();
                    }
                });
            }
        });
    }, 1000);
    
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
    // Usa delegazione eventi per gestire anche le slide create dinamicamente
    document.addEventListener('click', function(e) {
        if (e.target.matches('.carousel-slide img')) {
            e.stopPropagation();
            
            const img = e.target;
            const slide = img.closest('.carousel-slide');
            const caption = slide ? slide.querySelector('.carousel-caption') : null;
            
            let title = '';
            let desc = '';
            
            if (caption) {
                const titleElement = caption.querySelector('h4');
                const descElement = caption.querySelector('p');
                
                if (titleElement) title = titleElement.textContent;
                if (descElement) desc = descElement.textContent;
            }
            
            openModal(img.src, title, desc);
        }
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
});