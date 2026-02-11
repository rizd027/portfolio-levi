// Media Preloader Logic
const initPreloader = () => {
    const preloader = document.getElementById('preloader');
    const progressBar = document.getElementById('preloader-progress');
    const percentageText = document.getElementById('preloader-percentage');
    const mediaElements = [...document.querySelectorAll('img, video')];

    let loadedCount = 0;
    const totalMedia = mediaElements.length;

    if (totalMedia === 0) {
        finishLoading();
        return;
    }

    const updateProgress = () => {
        loadedCount++;
        const progress = Math.round((loadedCount / totalMedia) * 100);

        if (progressBar) progressBar.style.width = `${progress}%`;
        if (percentageText) percentageText.textContent = `${progress}%`;

        if (loadedCount >= totalMedia) {
            setTimeout(finishLoading, 500); // Slight delay for "completed" look
        }
    };

    function finishLoading() {
        if (preloader) {
            preloader.classList.add('fade-out');
            document.body.classList.remove('no-scroll');

            // Re-init AOS and Lenis after loading
            AOS.refresh();

            setTimeout(() => {
                preloader.style.display = 'none';
            }, 1000);
        }
    }

    mediaElements.forEach(el => {
        if (el.tagName.toLowerCase() === 'img') {
            if (el.complete) {
                updateProgress();
            } else {
                el.addEventListener('load', updateProgress);
                el.addEventListener('error', updateProgress); // Count errors too to avoid blocking
            }
        } else if (el.tagName.toLowerCase() === 'video') {
            // Check if metadata is already loaded
            if (el.readyState >= 2) {
                updateProgress();
            } else {
                el.addEventListener('loadeddata', updateProgress);
                el.addEventListener('error', updateProgress);
            }
        }
    });

    // Fallback: If it takes too long (e.g., 5 seconds), just show the site
    setTimeout(() => {
        if (preloader && !preloader.classList.contains('fade-out')) {
            finishLoading();
        }
    }, 8000);
};

// Initialize Preloader as soon as possible
document.addEventListener('DOMContentLoaded', () => {
    // Add no-scroll initially
    document.body.classList.add('no-scroll');
    initPreloader();
});

// Initialize Lenis (Luxury Smooth Scroll)
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}

requestAnimationFrame(raf);

// Custom Cursor Logic
const cursorDot = document.querySelector('.cursor-dot');
const cursorOutline = document.querySelector('.cursor-outline');

// Only activate on non-touch devices
if (window.matchMedia("(pointer: fine)").matches) {
    window.addEventListener('mousemove', (e) => {
        const posX = e.clientX;
        const posY = e.clientY;

        // Dot follows instantly
        cursorDot.style.left = `${posX}px`;
        cursorDot.style.top = `${posY}px`;

        // Outline follows with a slight smooth lag using Web Animations API
        cursorOutline.animate({
            left: `${posX}px`,
            top: `${posY}px`
        }, { duration: 500, fill: "forwards" });
    });

    // Hover Effects
    const interactiveElements = document.querySelectorAll('a, button, .gallery-item, .video-wrapper, .video-item, .large-feature-item, .sub-feature-card, .comcard-item');

    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            document.body.classList.add('hovering');
        });
        el.addEventListener('mouseleave', () => {
            document.body.classList.remove('hovering');
        });
    });
}
AOS.init({
    duration: 1000,
    once: true,
    offset: 100,
});

// Cache DOM Elements for Performance
const navbar = document.querySelector('.navbar');
const heroBg = document.querySelector('.hero-bg');
const heroOverlay = document.querySelector('.hero-overlay');
const heroContent = document.querySelector('.hero-content');
const navLinkItems = document.querySelectorAll('.nav-links a');
const sections = document.querySelectorAll('section[id], header[id]');

// Performance-Optimized Scroll Engine
let lastScrollY = window.scrollY;
let ticking = false;
let sectionData = [];

// Pre-calculate section positions to avoid layout thrashing on scroll
const cacheSectionPositions = () => {
    sectionData = Array.from(sections).map(section => ({
        id: section.getAttribute('id'),
        top: section.offsetTop - 150, // Offset for better active state timing
        height: section.offsetHeight
    }));
};

const updateUI = () => {
    const scrollY = lastScrollY;

    // 1. Navbar Scrolled State
    if (scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }

    // 2. Hero Animations (Subtle & Smooth)
    if (heroBg && scrollY < window.innerHeight) {
        const moveY = scrollY * 0.1;
        const scale = 1.1 + (scrollY * 0.00004);
        heroBg.style.transform = `scale(${scale}) translateY(${moveY}px)`;

        if (heroOverlay) {
            heroOverlay.style.opacity = Math.min(0.7 + (scrollY / 1500), 0.96);
        }

        if (heroContent) {
            heroContent.style.opacity = Math.max(1 - (scrollY / 800), 0);
            heroContent.style.transform = `translateY(${scrollY * 0.12}px)`;
        }
    }

    // 3. Active Link State (High Efficiency)
    let current = '';
    for (let i = sectionData.length - 1; i >= 0; i--) {
        if (scrollY >= sectionData[i].top) {
            current = sectionData[i].id;
            break;
        }
    }

    navLinkItems.forEach(item => {
        const href = item.getAttribute('href').slice(1);
        if (href === current) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    ticking = false;
};

// Listen for scroll with passive flag for better performance
window.addEventListener('scroll', () => {
    lastScrollY = window.scrollY;
    if (!ticking) {
        window.requestAnimationFrame(updateUI);
        ticking = true;
    }
}, { passive: true });

// Re-calculate positions on resize or orientation change
window.addEventListener('resize', cacheSectionPositions);
window.addEventListener('load', () => {
    cacheSectionPositions();
    updateUI(); // Initial run
});

// Mobile Menu Toggle Logic
const mobileMenu = document.getElementById('mobile-menu');
const navLinks = document.querySelector('.nav-links');

if (mobileMenu) {
    mobileMenu.addEventListener('click', () => {
        mobileMenu.classList.toggle('active');
        navLinks.classList.toggle('active');
        document.body.classList.toggle('no-scroll');
    });
}

document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        mobileMenu?.classList.remove('active');
        navLinks?.classList.remove('active');
        document.body.classList.remove('no-scroll');
    });
});

// Image Load Effect (Lazy Fade-in)
document.querySelectorAll('.gallery-item img, .compact-card img').forEach(img => {
    if (img.complete) {
        img.classList.add('loaded');
    } else {
        img.addEventListener('load', () => img.classList.add('loaded'));
    }
});

// Gallery Filtering Logic
const filterButtons = document.querySelectorAll('.filter-btn');
// Only photo cards should be in the lightbox
const galleryItems = document.querySelectorAll('.gallery-item, .sub-feature-card:not(:has(video)), .comcard-item:not(.stats-card):not(.vert-title):not(.contact-card)');
// Fallback logic
const allPotentialGalleryItems = document.querySelectorAll('.gallery-item, .sub-feature-card, .large-feature-item, .comcard-item:not(.stats-card):not(.vert-title):not(.contact-card)');
const galleryItemsList = Array.from(allPotentialGalleryItems).filter(item => item.querySelector('img'));

filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove active class from all buttons and add to clicked one
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filterValue = btn.getAttribute('data-filter');

        galleryItems.forEach(item => {
            if (filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
                item.classList.remove('hide');
                item.classList.add('show');
            } else {
                item.classList.remove('show');
                item.classList.add('hide');
            }
        });

        // Re-calculate section positions after layout change
        setTimeout(cacheSectionPositions, 500);
    });
});

// Optimized Video Playback Observer
const setupVideoObserver = () => {
    const videoOptions = {
        threshold: 0.2 // Play when 20% visible
    };

    const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const video = entry.target;
            if (entry.isIntersecting) {
                const playPromise = video.play();
                if (playPromise !== undefined) {
                    playPromise.catch(() => {
                        // Silent catch for autoplay blocks
                    });
                }
            } else {
                video.pause();
            }
        });
    }, videoOptions);

    document.querySelectorAll('.media-box video, .video-wrapper video').forEach(video => {
        videoObserver.observe(video);
    });
};

// Premium Reveal & Lazy Optimization Engine
const setupRevealObserver = () => {
    const revealOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Reveal element
                entry.target.classList.add('revealed');

                // If it's a video item, start preloading metadata if not already
                const video = entry.target.querySelector('video');
                if (video && video.getAttribute('preload') === 'metadata') {
                    video.load(); // Trigger load
                }

                // Once revealed, we can stop observing this specific element
                observer.unobserve(entry.target);
            }
        });
    }, revealOptions);

    // Apply reveal class and observe elements
    const elementsToReveal = [
        ...document.querySelectorAll('.gallery-item'),
        ...document.querySelectorAll('.video-item'),
        ...document.querySelectorAll('.large-feature-item'),
        ...document.querySelectorAll('.sub-feature-card'),
        ...document.querySelectorAll('.comcard-item'),
        ...document.querySelectorAll('.about-text'),
        ...document.querySelectorAll('.about-image'),
        ...document.querySelectorAll('.social-card')
    ];

    elementsToReveal.forEach(el => {
        el.classList.add('reveal');
        revealObserver.observe(el);
    });
};

// Initialize Optimizations
document.addEventListener('DOMContentLoaded', () => {
    setupRevealObserver();
    setupVideoObserver();
});

window.addEventListener('load', () => {
    // Refresh position data
    cacheSectionPositions();
});

// Lightbox Functionality
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxClose = document.querySelector('.lightbox-close');
const lightboxCaption = document.querySelector('.lightbox-caption');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');

let currentIndex = 0;
let visibleItems = [];

const updateVisibleItems = () => {
    visibleItems = galleryItemsList.filter(item => !item.classList.contains('hide'));
};

const showImage = (index) => {
    if (index < 0) index = visibleItems.length - 1;
    if (index >= visibleItems.length) index = 0;

    currentIndex = index;
    const img = visibleItems[currentIndex].querySelector('img');
    const info = visibleItems[currentIndex].querySelector('.gallery-info span');

    // Smooth transition refinement
    lightboxImg.classList.add('changing');

    setTimeout(() => {
        lightboxImg.src = img.src;
        lightboxCaption.textContent = info ? info.textContent : '';
        lightboxImg.classList.remove('changing');
    }, 150);
};


// Touch Support for Lightbox
let touchStartX = 0;
let touchEndX = 0;

lightbox.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
}, { passive: true });

lightbox.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
}, { passive: true });

const handleSwipe = () => {
    const swipeThreshold = 50;
    if (touchEndX < touchStartX - swipeThreshold) showImage(currentIndex + 1); // Swipe Left -> Next
    if (touchEndX > touchStartX + swipeThreshold) showImage(currentIndex - 1); // Swipe Right -> Prev
};

galleryItemsList.forEach((item, index) => {
    item.addEventListener('click', () => {
        updateVisibleItems();
        currentIndex = visibleItems.indexOf(item);
        if (currentIndex === -1) return; // Not a visible photo
        showImage(currentIndex);
        lightbox.classList.add('active');
        document.body.classList.add('no-scroll');
    });
});

lightboxClose.addEventListener('click', () => {
    lightbox.classList.remove('active');
    document.body.classList.remove('no-scroll');
});

lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
        lightbox.classList.remove('active');
        document.body.classList.remove('no-scroll');
    }
});

prevBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    showImage(currentIndex - 1);
});

nextBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    showImage(currentIndex + 1);
});


// Video playback is now handled via autoplay attribute in HTML for all sections.

// Keyboard Navigation for Lightbox
document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;

    if (e.key === 'Escape') lightboxClose.click();
    if (e.key === 'ArrowLeft') prevBtn.click();
    if (e.key === 'ArrowRight') nextBtn.click();
});
