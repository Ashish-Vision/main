// ================= PORTFOLIO V2 CONTROLLER JAVASCRIPT =================

document.addEventListener("DOMContentLoaded", () => {
    
    // 1. DISMISS GLOBAL LOADER
    const loader = document.getElementById('loader');
    if (loader) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                loader.style.opacity = '0';
                setTimeout(() => {
                    loader.style.display = 'none';
                }, 800);
            }, 600);
        });

        // Backup timeout (in case of cached assets or slow loads)
        setTimeout(() => {
            if (loader.style.opacity !== '0') {
                loader.style.opacity = '0';
                setTimeout(() => loader.style.display = 'none', 800);
            }
        }, 3000);
    }

    // 2. BACKGROUND AMBIENT GLOW MOUSE TRACKING
    const ambientGlow = document.getElementById("ambientGlow");
    if (ambientGlow) {
        document.addEventListener("mousemove", (e) => {
            const x = e.clientX - 350; // Offset by half width
            const y = e.clientY - 350; // Offset by half height
            ambientGlow.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        }, { passive: true });
    }

    // 3. INTERACTIVE 3D GYROSCOPE CORE CONTROLLER (MOUSE & TOUCH DRAG + MOMENTUM)
    const gyro = document.getElementById("interactiveGyro");
    const scene = document.getElementById("cubeScene");

    if (gyro && scene) {
        let isDragging = false;
        let previousMousePosition = { x: 0, y: 0 };
        
        // Gyro rotation angles
        let rotationX = 60;
        let rotationY = 30;
        
        // Auto rotation speed variables
        let autoRotateActive = true;
        const autoRotateSpeed = 0.25; // Degrees per frame
        let idleTimeout = null;

        // Render Loop for automatic rotation
        function renderLoop() {
            if (autoRotateActive && !isDragging) {
                rotationY += autoRotateSpeed;
                gyro.style.transform = `rotateX(${rotationX}deg) rotateY(${rotationY}deg)`;
            }
            requestAnimationFrame(renderLoop);
        }
        requestAnimationFrame(renderLoop);

        // Reset auto rotation if user is idle
        function resetIdleTimer() {
            autoRotateActive = false;
            clearTimeout(idleTimeout);
            idleTimeout = setTimeout(() => {
                autoRotateActive = true;
            }, 3000); // Resume auto-rotate after 3s of idleness
        }

        // Drag start triggers
        const dragStart = (clientX, clientY) => {
            isDragging = true;
            resetIdleTimer();
            previousMousePosition = { x: clientX, y: clientY };
        };

        // Drag movement calculations
        const dragMove = (clientX, clientY) => {
            if (!isDragging) return;
            
            const deltaX = clientX - previousMousePosition.x;
            const deltaY = clientY - previousMousePosition.y;

            // Update rotation variables
            rotationY += deltaX * 0.4;
            rotationX -= deltaY * 0.4;

            // Limit X rotation to avoid extreme values
            rotationX = Math.max(-85, Math.min(85, rotationX));

            gyro.style.transform = `rotateX(${rotationX}deg) rotateY(${rotationY}deg)`;
            previousMousePosition = { x: clientX, y: clientY };
        };

        // Drag stop triggers
        const dragEnd = () => {
            isDragging = false;
            resetIdleTimer();
        };

        // A. Mouse Bindings
        scene.addEventListener("mousedown", (e) => {
            dragStart(e.clientX, e.clientY);
        });

        document.addEventListener("mousemove", (e) => {
            if (isDragging) dragMove(e.clientX, e.clientY);
        }, { passive: true });

        document.addEventListener("mouseup", dragEnd);

        // B. Mobile Touch Bindings (Crucial for mobile responsiveness)
        scene.addEventListener("touchstart", (e) => {
            if (e.touches.length === 1) {
                dragStart(e.touches[0].clientX, e.touches[0].clientY);
            }
        }, { passive: true });

        scene.addEventListener("touchmove", (e) => {
            if (isDragging && e.touches.length === 1) {
                dragMove(e.touches[0].clientX, e.touches[0].clientY);
            }
        }, { passive: true });

        scene.addEventListener("touchend", dragEnd);
    }

    // 4. GLASS CARD LIGHTING & 3D PARALLAX TILT ENGINE
    const glassCards = document.querySelectorAll(".glass");
    
    // Check if device is touch-oriented to bypass expensive 3D transforms
    const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;

    glassCards.forEach(card => {
        // A. Light Reflection Tracker (Always active)
        card.addEventListener("mousemove", (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            card.style.setProperty("--mouse-x", `${x}px`);
            card.style.setProperty("--mouse-y", `${y}px`);
        }, { passive: true });

        // B. 3D Card Parallax Tilt (Only active on desktops/laptops to prevent mobile lag)
        if (!isTouchDevice && card.classList.contains("tilt-target")) {
            card.addEventListener("mousemove", (e) => {
                const rect = card.getBoundingClientRect();
                
                // Get mouse coordinates relative to the center of the card
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                
                const mouseX = e.clientX - centerX;
                const mouseY = e.clientY - centerY;
                
                // Convert coordinates to rotation angles (max tilt of 10 degrees)
                const rotateX = -10 * (mouseY / (rect.height / 2));
                const rotateY = 10 * (mouseX / (rect.width / 2));
                
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
            });

            card.addEventListener("mouseleave", () => {
                // Return to normal
                card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
            });
        }
    });

    // Dynamic border glows on Skill Cards
    const skillCards = document.querySelectorAll(".skill-card");
    skillCards.forEach(card => {
        const glowColor = card.getAttribute("data-glow-color") || "#06b6d4";
        // Hex to RGBA conversion for soft glowing shadows
        let r = 6, g = 182, b = 212;
        if (glowColor.startsWith("#")) {
            const hex = glowColor.replace("#", "");
            r = parseInt(hex.substring(0, 2), 16);
            g = parseInt(hex.substring(2, 4), 16);
            b = parseInt(hex.substring(4, 6), 16);
        }
        
        card.addEventListener("mouseenter", () => {
            card.classList.add("glow-active");
            card.style.setProperty("--glow-color", glowColor);
            card.style.setProperty("--glow-color-trans", `rgba(${r}, ${g}, ${b}, 0.2)`);
        });
        
        card.addEventListener("mouseleave", () => {
            card.classList.remove("glow-active");
        });
    });

    // 5. NAVBAR SCROLL TRIGGER (Shrinks navigation capsule)
    const navbarWrapper = document.querySelector(".status-navbar-wrapper");
    window.addEventListener("scroll", () => {
        if (window.scrollY > 40) {
            navbarWrapper.classList.add("scrolled");
        } else {
            navbarWrapper.classList.remove("scrolled");
        }
    }, { passive: true });

    // 6. INTERSECTION OBSERVER FOR ACTIVE NAV LINKS & SCROLL REVEALS
    const sections = document.querySelectorAll("section");
    const navLinks = document.querySelectorAll(".nav-links a, .mobile-nav-links a");
    const revealElements = document.querySelectorAll(".scroll-reveal");

    // Section Observer configuration
    const sectionObserverOptions = {
        root: null,
        rootMargin: "-25% 0px -25% 0px", // Active when section occupies center 50%
        threshold: 0
    };

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const activeId = entry.target.getAttribute("id");
                
                navLinks.forEach(link => {
                    link.classList.remove("active");
                    if (link.getAttribute("href") === `#${activeId}`) {
                        link.classList.add("active");
                    }
                });
            }
        });
    }, sectionObserverOptions);

    sections.forEach(section => sectionObserver.observe(section));

    // Scroll Reveal Observer Configuration
    const revealObserverOptions = {
        root: null,
        rootMargin: "0px 0px -10% 0px", // Triggers slightly before element enters view
        threshold: 0.05
    };

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("reveal-visible");
            }
        });
    }, revealObserverOptions);

    revealElements.forEach(el => revealObserver.observe(el));

    // 6b. CINEMATIC SCROLL TRANSITIONS ON NAV CLICK
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener("click", (e) => {
            const targetId = link.getAttribute("href");
            if (targetId.startsWith("#")) {
                e.preventDefault();
                const targetSection = document.querySelector(targetId);
                if (targetSection) {
                    // Start cinematic focus zoom out
                    document.body.classList.add("page-transitioning");
                    
                    // Close mobile navigation menu if open
                    const mobileToggle = document.querySelector(".mobile-nav-toggle");
                    const mobileOverlay = document.querySelector(".mobile-nav-overlay");
                    if (mobileToggle && mobileToggle.classList.contains("open")) {
                        mobileToggle.classList.remove("open");
                        mobileOverlay.classList.remove("open");
                        document.body.classList.remove("no-scroll");
                    }
                    
                    // Header height offset (for accurate scrolling position alignment)
                    const headerOffset = 85; 
                    const targetPosition = targetSection.getBoundingClientRect().top + window.scrollY - headerOffset;
                    const startPosition = window.scrollY;
                    const distance = targetPosition - startPosition;
                    const duration = 1000; // 1 second smooth scroll duration
                    let startTimestamp = null;
                    
                    // Cubic easeInOut function
                    const easeInOutCubic = (t) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
                    
                    function animateScroll(timestamp) {
                        if (!startTimestamp) startTimestamp = timestamp;
                        const elapsed = timestamp - startTimestamp;
                        const progress = Math.min(elapsed / duration, 1);
                        
                        window.scrollTo(0, startPosition + distance * easeInOutCubic(progress));
                        
                        if (progress < 1) {
                            requestAnimationFrame(animateScroll);
                        } else {
                            // Delay slightly before focus snapped back to normal
                            setTimeout(() => {
                                document.body.classList.remove("page-transitioning");
                            }, 100);
                        }
                    }
                    
                    requestAnimationFrame(animateScroll);
                }
            }
        });
    });

    // 7. RESPONSIVE MOBILE NAVIGATION DRAWER
    const mobileToggle = document.querySelector(".mobile-nav-toggle");
    const mobileOverlay = document.querySelector(".mobile-nav-overlay");
    const mobileLinks = document.querySelectorAll(".mobile-nav-links a");

    function toggleMobileMenu() {
        mobileToggle.classList.toggle("open");
        mobileOverlay.classList.toggle("open");
        document.body.classList.toggle("no-scroll");
    }

    if (mobileToggle && mobileOverlay) {
        mobileToggle.addEventListener("click", toggleMobileMenu);
        
        mobileLinks.forEach(link => {
            link.addEventListener("click", () => {
                // Close menu when clicking a link
                mobileToggle.classList.remove("open");
                mobileOverlay.classList.remove("open");
                document.body.classList.remove("no-scroll");
            });
        });
    }

    // 8. INTERACTIVE ABOUT DASHBOARD TAB CONTROLLER
    const tabBtns = document.querySelectorAll(".db-tab-btn");
    const panels = document.querySelectorAll(".db-panel");

    tabBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const tabName = btn.getAttribute("data-tab");
            
            // Revert active tab classes
            tabBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            
            // Crossfade panels
            panels.forEach(panel => {
                if (panel.classList.contains("active")) {
                    panel.style.opacity = '0';
                    panel.style.transform = 'translateY(10px)';
                    setTimeout(() => {
                        panel.classList.remove("active");
                    }, 250);
                }
            });

            setTimeout(() => {
                const targetPanel = document.getElementById(`panel-${tabName}`);
                if (targetPanel) {
                    targetPanel.classList.add("active");
                    // Force repaint to trigger CSS animation
                    targetPanel.offsetWidth;
                    targetPanel.style.opacity = '1';
                    targetPanel.style.transform = 'translateY(0)';
                }
            }, 260);
        });
    });

    // 9. PREMIUM COMMAND LINE BOOT EMULATOR
    const terminalTexts = [
        "Specialty detected: CSE (AI & ML)",
        "Core competency: Java, Python, JavaScript, DSA",
        "Verified credentials loaded: IT Specialist, AWS Graduate",
        "Building responsive frontend systems...",
        "Solving computational equations...",
        "Handshake compiled successfully. System Ready."
    ];
    let terminalIdx = 0, charIdx = 0, isDeleting = false;
    const targetElement = document.getElementById("typed-text");

    function terminalTypeEngine() {
        if (!targetElement) return;
        
        const currentText = terminalTexts[terminalIdx];
        if (isDeleting) {
            targetElement.textContent = currentText.substring(0, charIdx - 1);
            charIdx--;
        } else {
            targetElement.textContent = currentText.substring(0, charIdx + 1);
            charIdx++;
        }

        let typeSpeed = isDeleting ? 20 : 40; // Quick typing speed

        if (!isDeleting && charIdx === currentText.length) {
            typeSpeed = 2500; // Longer pause at end of status line
            isDeleting = true;
        } else if (isDeleting && charIdx === 0) {
            isDeleting = false;
            terminalIdx = (terminalIdx + 1) % terminalTexts.length;
            typeSpeed = 500; // Pause before typing next command
        }

        setTimeout(terminalTypeEngine, typeSpeed);
    }
    if (targetElement) {
        setTimeout(terminalTypeEngine, 1000);
    }

    // 10. LEETCODE STATS COUNTER INCREMENT ANIMATION
    const counterElement = document.querySelector(".counter");
    if (counterElement) {
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const target = parseInt(counterElement.getAttribute("data-target"));
                    let current = 0;
                    const increment = target / 50; // Step speed
                    const updateCounter = () => {
                        current += increment;
                        if (current < target) {
                            counterElement.textContent = Math.ceil(current) + "+";
                            setTimeout(updateCounter, 25);
                        } else {
                            counterElement.textContent = target + "+";
                        }
                    };
                    updateCounter();
                    counterObserver.unobserve(counterElement); // Run only once
                }
            });
        }, { threshold: 0.5 });
        counterObserver.observe(counterElement);
    }

    // 11. CERTIFICATE VIEWPORT MODAL CONTROLLER
    const certModal = document.getElementById("certModal");
    const modalClose = document.getElementById("modalClose");
    const modalPdfViewer = document.getElementById("modalPdfViewer");
    const modalDownloadFallback = document.getElementById("modalDownloadFallback");
    const modalTitle = document.getElementById("modalTitle");
    const certCards = document.querySelectorAll(".cert-card-v2");

    if (certModal && modalClose && modalPdfViewer) {
        certCards.forEach(card => {
            card.addEventListener("click", () => {
                const pdfName = card.getAttribute("data-pdf");
                const certTitle = card.querySelector("h3").textContent;
                
                // Detect mobile screen widths or touch-coarse pointer interfaces
                const isMobile = window.matchMedia("(max-width: 768px)").matches || 
                                 window.matchMedia("(pointer: coarse)").matches;
                
                if (isMobile) {
                    // Redirect mobile users to direct PDF tab for native zooming and scrolling
                    window.open(pdfName, '_blank');
                    return;
                }
                
                // Embed target pdf path with scroll & UI toolbar suppression for desktop
                const pdfPath = `${pdfName}#toolbar=0&navpanes=0&scrollbar=0`;
                modalPdfViewer.setAttribute("data", pdfPath);
                if (modalDownloadFallback) {
                    modalDownloadFallback.setAttribute("href", pdfName);
                }
                modalTitle.textContent = certTitle;
                
                // Open Modal with lock scroll
                certModal.classList.add("active");
                document.body.classList.add("no-scroll");
            });
        });

        const closeModalFunc = () => {
            certModal.classList.remove("active");
            document.body.classList.remove("no-scroll");
            // Unload PDF content to stop browser resource processing in background
            setTimeout(() => {
                modalPdfViewer.setAttribute("data", "");
            }, 500);
        };

        modalClose.addEventListener("click", closeModalFunc);
        
        // Close on clicking backdrop
        const backdrop = certModal.querySelector(".modal-backdrop");
        if (backdrop) {
            backdrop.addEventListener("click", closeModalFunc);
        }
    }

    // 12. FORM ANIMATION FEEDBACK & AJAX SUBMISSION
    const contactForm = document.getElementById("contactForm");
    if (contactForm) {
        contactForm.addEventListener("submit", (e) => {
            const submitBtn = document.getElementById("formSubmitBtn");
            const btnText = submitBtn.querySelector("span");
            const btnIcon = submitBtn.querySelector("i");
            
            btnText.textContent = "Sending...";
            btnIcon.className = "fas fa-spinner fa-spin";
            submitBtn.style.opacity = "0.7";
            submitBtn.style.pointerEvents = "none";
            
            e.preventDefault();
            
            const formData = new FormData(contactForm);
            
            fetch(contactForm.getAttribute("action"), {
                method: "POST",
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            })
            .then(response => {
                if (response.ok) {
                    // Success render
                    contactForm.innerHTML = `
                        <div class="form-success-message">
                            <i class="fas fa-check-circle"></i>
                            <h2>Message Sent Successfully!</h2>
                            <p style="color: var(--text-secondary); margin-top: 10px;">
                                Thank you for getting in touch. I will get back to you as soon as possible.
                            </p>
                        </div>
                    `;
                } else {
                    throw new Error("Failed to send message");
                }
            })
            .catch(error => {
                // Revert button state
                btnText.textContent = "Send Message";
                btnIcon.className = "fas fa-paper-plane";
                submitBtn.style.opacity = "1";
                submitBtn.style.pointerEvents = "auto";
                alert("Something went wrong. Please try sending your message again.");
            });
        });
    }
});
