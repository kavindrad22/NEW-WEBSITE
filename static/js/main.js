document.addEventListener("DOMContentLoaded", () => {
  // ===== AGE GATE =====
  const ageGate = document.getElementById("age-gate");
  if (ageGate) {
    // If already verified this session or permanently, skip the gate
    if (
      sessionStorage.getItem("ageVerified") === "true" ||
      localStorage.getItem("ageVerified") === "true"
    ) {
      ageGate.style.display = "none";
    } else {
      // Show the gate
      ageGate.style.display = "flex";

      const submitBtn = document.getElementById("age-submit");
      const errText = document.getElementById("age-error");

      if (submitBtn) {
        const inputDD = document.getElementById("age-dd");
        const inputMM = document.getElementById("age-mm");
        const inputYYYY = document.getElementById("age-yyyy");

        if (inputDD && inputMM && inputYYYY) {
          inputDD.addEventListener("input", (e) => {
            e.target.value = e.target.value.replace(/\D/g, "");
            if (e.target.value.length === 2) inputMM.focus();
          });
          inputMM.addEventListener("input", (e) => {
            e.target.value = e.target.value.replace(/\D/g, "");
            if (e.target.value.length === 2) inputYYYY.focus();
          });
          inputYYYY.addEventListener("input", (e) => {
            e.target.value = e.target.value.replace(/\D/g, "");
          });
        }

        submitBtn.addEventListener("click", () => {
          const dd = parseInt(inputDD.value);
          const mm = parseInt(inputMM.value);
          const yyyy = parseInt(inputYYYY.value);

          if (
            !dd ||
            !mm ||
            !yyyy ||
            isNaN(dd) ||
            isNaN(mm) ||
            isNaN(yyyy) ||
            dd > 31 ||
            mm > 12 ||
            yyyy < 1900
          ) {
            errText.textContent = "Please enter a valid date.";
            errText.classList.remove("hidden");
            return;
          }

          const birthDate = new Date(yyyy, mm - 1, dd);
          const today = new Date();

          let age = today.getFullYear() - birthDate.getFullYear();
          const m = today.getMonth() - birthDate.getMonth();
          if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }

          if (age >= 19) {
            errText.classList.add("hidden");

            const rememberMe = document.getElementById("age-remember");
            if (rememberMe && rememberMe.checked) {
              localStorage.setItem("ageVerified", "true");
            } else {
              sessionStorage.setItem("ageVerified", "true");
            }

            ageGate.style.transition = "opacity 0.6s ease";
            ageGate.style.opacity = "0";
            setTimeout(() => {
              ageGate.style.display = "none";
              ageGate.style.pointerEvents = "none";
            }, 600);
          } else {
            errText.textContent = "Access Denied. You must be 19+ to enter.";
            errText.classList.remove("hidden");

            // Disable inputs and button to reject the attempt
            inputDD.disabled = true;
            inputMM.disabled = true;
            inputYYYY.disabled = true;
            submitBtn.disabled = true;
            submitBtn.style.opacity = "0.5";
            submitBtn.style.cursor = "not-allowed";

            // Redirect away after a short delay
            setTimeout(() => {
              window.location.href = "https://www.google.com";
            }, 2000);
          }
        });
      }
    }
  }
  // ===== END AGE GATE =====

  // Mobile menu toggle
  const mobileMenuBtn = document.getElementById("mobile-menu-btn");
  const mobileMenu = document.getElementById("mobile-menu");

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener("click", () => {
      mobileMenu.classList.toggle("hidden");
      // Optional: add slight fade animation via JS or Tailwind classes
    });
  }

  // Navbar background on scroll
  const navbar = document.getElementById("navbar");
  if (navbar) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 50) {
        navbar.classList.replace("bg-black/40", "bg-black/80");
        navbar.classList.replace("backdrop-blur-md", "backdrop-blur-lg");
        navbar.classList.replace("py-6", "py-4");
        navbar.classList.add("shadow-2xl");
      } else {
        navbar.classList.replace("bg-black/80", "bg-black/40");
        navbar.classList.replace("backdrop-blur-lg", "backdrop-blur-md");
        navbar.classList.replace("py-4", "py-6");
        navbar.classList.remove("shadow-2xl");
      }
    });
  }

  // Initialize GSAP
  if (typeof gsap !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);

    // Standard reveal animation for sections
    const revealElements = gsap.utils.toArray(".gs-reveal");

    revealElements.forEach(function (elem) {
      // Hide elements initially
      gsap.set(elem, { autoAlpha: 0, y: 50 });

      ScrollTrigger.create({
        trigger: elem,
        start: "top 80%",
        onEnter: function () {
          gsap.to(elem, {
            duration: 1.2,
            autoAlpha: 1,
            y: 0,
            ease: "power4.out",
            overwrite: "auto",
          });
        },
        once: true,
      });
    });

    // Staggered text reveal for hero headings
    const staggerTexts = gsap.utils.toArray(".stagger-reveal span");
    if (staggerTexts.length > 0) {
      gsap.set(staggerTexts, { y: 30, opacity: 0 });
      gsap.to(staggerTexts, {
        y: 0,
        opacity: 1,
        duration: 1,
        stagger: 0.15,
        ease: "power4.out",
        delay: 0.2,
      });
    }

    // Hero image floating/breathing effect
    const heroImg = document.querySelector(".hero-img");
    if (heroImg) {
      gsap.to(heroImg, {
        scale: 1.05,
        duration: 25,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    }
  }

  // ===== GLOBAL PERSISTENT CART LOGIC =====
  const addToCartBtn = document.getElementById("add-to-cart-btn");
  const qtyInput = document.getElementById("qty");

  // Initialize cart count from localStorage
  let cartCount = parseInt(localStorage.getItem("taprobaneCartCount")) || 0;
  let cartBadges = [];

  // Initialize language from localStorage
  const languages = [
    {
      code: "en",
      name: "English",
      flag: '<img src="https://flagcdn.com/20x15/ca.png" alt="EN" class="w-5 h-auto rounded-[2px] opacity-90 inline-block">',
    },
    {
      code: "es",
      name: "Spanish",
      flag: '<img src="https://flagcdn.com/20x15/es.png" alt="ES" class="w-5 h-auto rounded-[2px] opacity-90 inline-block">',
    },
    {
      code: "fr",
      name: "French",
      flag: '<img src="https://flagcdn.com/20x15/fr.png" alt="FR" class="w-5 h-auto rounded-[2px] opacity-90 inline-block">',
    },
    {
      code: "de",
      name: "German",
      flag: '<img src="https://flagcdn.com/20x15/de.png" alt="DE" class="w-5 h-auto rounded-[2px] opacity-90 inline-block">',
    },
  ];
  let selectedLang = localStorage.getItem("taprobaneLang") || "en";

  // Create Toast Container (Global)
  const toastContainer = document.createElement("div");
  toastContainer.className =
    "fixed bottom-10 right-10 z-[100] flex flex-col gap-4 pointer-events-none";
  document.body.appendChild(toastContainer);

  // Function to update all cart badges across the site
  function updateCartBadges() {
    cartBadges.forEach((badge) => {
      badge.innerText = cartCount;
      if (cartCount > 0) {
        badge.classList.remove("opacity-0");
        badge.classList.add("opacity-100");
      } else {
        badge.classList.add("opacity-0");
        badge.classList.remove("opacity-100");
      }
    });
    localStorage.setItem("taprobaneCartCount", cartCount);
  }

  // Add a floating cart counter and Language Selector to the nav (on EVERY page)
  const navbars = document.querySelectorAll(
    "#navbar .max-w-7xl > div.hidden, #mobile-menu",
  );
  navbars.forEach((container) => {
    const headerActions = document.createElement("div");
    headerActions.className =
      "flex items-center gap-6 pointer-events-auto h-full";

    // 1. Language Selector
    const langContainer = document.createElement("div");
    langContainer.className = "relative group/lang";

    const currentLang =
      languages.find((l) => l.code === selectedLang) || languages[0];

    langContainer.innerHTML = `
            <button id="lang-toggle-btn" class="flex items-center gap-2 px-3 py-2 rounded-sm border border-white/5 hover:border-gold/30 hover:bg-white/5 transition-all duration-300 text-sm">
                <span class="flex items-center justify-center">${currentLang.flag}</span>
                <span class="text-xs text-gray-400 font-medium uppercase tracking-widest hidden lg:inline">${currentLang.code}</span>
                <svg class="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
            <div id="lang-dropdown" class="absolute right-0 mt-2 w-40 bg-dark-bg/98 backdrop-blur-xl border border-white/10 rounded-sm shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[100] overflow-hidden hidden" style="top: 100%;">
                <div class="py-1">
                    ${languages
                      .map(
                        (lang) => `
                        <button data-code="${lang.code}" class="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gold/10 transition-colors ${selectedLang === lang.code ? "bg-gold/5" : ""}">
                            <div class="flex items-center justify-between w-full">
                                <span class="text-xs uppercase tracking-widest ${selectedLang === lang.code ? "text-gold font-bold" : "text-gray-400"} hover:text-white">${lang.name}</span>
                                <span class="flex items-center justify-center">${lang.flag}</span>
                            </div>
                        </button>
                    `,
                      )
                      .join("")}
                </div>
            </div>
        `;

    // Click-toggle logic for the dropdown
    const toggleBtn = langContainer.querySelector("#lang-toggle-btn");
    const dropdown = langContainer.querySelector("#lang-dropdown");

    if (toggleBtn && dropdown) {
      toggleBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const isOpen = !dropdown.classList.contains("hidden");
        // Close all other lang dropdowns first
        document
          .querySelectorAll("#lang-dropdown")
          .forEach((d) => d.classList.add("hidden"));
        if (!isOpen) dropdown.classList.remove("hidden");
      });

      // Close when clicking outside
      document.addEventListener("click", () => {
        dropdown.classList.add("hidden");
      });
    }

    // Language toggle logic
    langContainer.querySelectorAll("button[data-code]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const newCode = btn.getAttribute("data-code");
        localStorage.setItem("taprobaneLang", newCode);
        window.location.reload(); // Reload to refresh UI with new language context
      });
    });

    // 2. Cart Badge
    const badgeContainer = document.createElement("div");
    badgeContainer.className = "flex items-center gap-2 cursor-pointer group";

    badgeContainer.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (window.openCheckoutModal) {
        window.openCheckoutModal();
      } else {
        console.warn("Cart: checkout.js not loaded on this page.");
      }
    });

    badgeContainer.innerHTML = `
            <svg class="w-5 h-5 text-gray-300 group-hover:text-gold transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
            <span class="bg-gold text-black rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold cart-counter-badge opacity-0 transition-opacity">0</span>
        `;

    headerActions.appendChild(langContainer);
    headerActions.appendChild(badgeContainer);

    // Styling for mobile menu vs desktop navbar
    if (container.id === "mobile-menu") {
      headerActions.classList.add(
        "px-8",
        "py-10",
        "border-t",
        "border-white/5",
        "justify-center",
        "mt-auto",
        "flex-col",
        "gap-8",
      );
      // Remove some absolute positioning for mobile dropdown
      langContainer
        .querySelector("div")
        .classList.remove("absolute", "right-0");
      langContainer
        .querySelector("div")
        .classList.add(
          "relative",
          "w-full",
          "mt-4",
          "opacity-100",
          "visible",
          "bg-transparent",
          "border-none",
          "shadow-none",
        );
      container.appendChild(headerActions);
    } else {
      container.appendChild(headerActions);
    }
    cartBadges.push(badgeContainer.querySelector("span"));
  });

  // Initial Badge Update
  updateCartBadges();

  // "Add to Cart" functionality (only on Products page)
  if (addToCartBtn) {
    addToCartBtn.addEventListener("click", () => {
      const qty = qtyInput ? Math.max(1, parseInt(qtyInput.value) || 1) : 1;
      const price = 25.99;
      const total = (qty * price).toFixed(2);

      cartCount += qty;
      updateCartBadges();

      // Create Animated Toast
      const toast = document.createElement("div");
      toast.className =
        "bg-dark-surface border border-gold border-l-4 shadow-[0_30px_60px_rgba(0,0,0,0.8)] text-white px-6 py-4 rounded-sm transform translate-x-[150%] transition-transform duration-500 flex items-center gap-4 pointer-events-auto";

      toast.innerHTML = `
                <div class="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0">
                    <svg class="w-4 h-4 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <div class="flex-1">
                    <h4 class="font-heading font-bold text-base leading-tight">Added to Cart</h4>
                    <p class="text-[10px] text-gray-400 font-light mt-1 uppercase tracking-widest leading-none">${qty}x Taprobane Pack - $${total} CAD</p>
                </div>
                <button class="text-gray-500 hover:text-white" onclick="this.parentElement.remove()">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            `;

      toastContainer.appendChild(toast);

      // Slide in
      requestAnimationFrame(() => {
        toast.classList.replace("translate-x-[150%]", "translate-x-0");
      });

      // Slide out & remove after 3.5s
      setTimeout(() => {
        if (toast.parentElement) {
          toast.classList.replace("translate-x-0", "translate-x-[150%]");
          setTimeout(() => toast.remove(), 500);
        }
      }, 3500);
    });
  }
});
