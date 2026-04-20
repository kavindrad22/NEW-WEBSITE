/**
 * Taprobane Lager — Checkout Handler
 * ====================================
 * SETUP INSTRUCTIONS:
 *
 * 1. STRIPE (Card payments):
 *    - Sign up at https://stripe.com
 *    - Dashboard → Developers → API Keys → copy "Publishable key" (pk_live_...)
 *    - Paste it below as STRIPE_PUBLISHABLE_KEY
 *
 * 2. PAYPAL:
 *    - Sign up at https://developer.paypal.com
 *    - My Apps → Create App → copy "Client ID"
 *    - Paste it below as PAYPAL_CLIENT_ID
 */

// ── YOUR KEYS (fill these in) ─────────────────────────────────────────────────
const STRIPE_PUBLISHABLE_KEY = "YOUR_STRIPE_PUBLISHABLE_KEY"; // e.g. pk_live_...
const STRIPE_PRICE_ID = "YOUR_STRIPE_PRICE_ID"; // e.g. price_1Nxb... (Create this in Stripe Dashboard -> Products)
const PAYPAL_CLIENT_ID = "YOUR_PAYPAL_CLIENT_ID"; // from developer.paypal.com
const PRICE_PER_PACK = 25.99;
// ─────────────────────────────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
  // Safety: ensure body scroll is never locked on page load
  document.body.style.overflow = "";

  // ── DOM REFS ──────────────────────────────────────────────────────────────
  const modal = document.getElementById("checkout-modal");
  const panel = document.getElementById("checkout-panel");
  const backdrop = document.getElementById("checkout-backdrop");
  const closeBtn = document.getElementById("close-checkout");
  const addToCart = document.getElementById("add-to-cart-btn");
  const qtyInput = document.getElementById("qty");
  const qtyLabel = document.getElementById("checkout-qty-label");
  const totalLabel = document.getElementById("checkout-total");

  if (!modal || !panel) {
    console.warn("Checkout: modal elements not found.");
    return;
  }

  // ── OPEN / CLOSE MODAL ────────────────────────────────────────────────────
  function openModal() {
    const qty = qtyInput ? Math.max(1, parseInt(qtyInput.value) || 1) : 1;

    if (qtyLabel) qtyLabel.textContent = `Quantity: ${qty}`;
    if (totalLabel) totalLabel.textContent = ``;

    // Ensure it's interactive before animating in
    modal.classList.remove("opacity-0", "pointer-events-none");
    modal.classList.add("opacity-100");
    panel.classList.remove("scale-95");
    panel.classList.add("scale-100");
    document.body.style.overflow = "hidden";

    // Mount Stripe card element first time
    mountStripeCard();
  }

  function closeModal() {
    // Immediately block pointer events so the invisible overlay never eats clicks
    modal.classList.add("pointer-events-none");
    modal.classList.remove("opacity-100");
    modal.classList.add("opacity-0");
    panel.classList.remove("scale-100");
    panel.classList.add("scale-95");
    // Always restore scroll
    document.body.style.overflow = "";
  }

  // Expose modal functions globally so they can be called from other scripts
  window.openCheckoutModal = openModal;
  window.closeCheckoutModal = closeModal;

  // Wire up trigger
  if (addToCart) addToCart.addEventListener("click", openModal);
  if (closeBtn) closeBtn.addEventListener("click", closeModal);
  if (backdrop) backdrop.addEventListener("click", closeModal);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });

  // ── PAYMENT TABS ──────────────────────────────────────────────────────────
  document.querySelectorAll(".payment-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = tab.dataset.tab;

      document.querySelectorAll(".payment-tab").forEach((t) => {
        t.classList.remove("border-gold", "text-gold", "bg-gold/5");
        t.classList.add("border-white/10", "text-gray-400");
      });
      tab.classList.add("border-gold", "text-gold", "bg-gold/5");
      tab.classList.remove("border-white/10", "text-gray-400");

      document
        .querySelectorAll(".payment-tab-content")
        .forEach((c) => c.classList.add("hidden"));
      const content = document.getElementById(`tab-${target}`);
      if (content) content.classList.remove("hidden");

      // Load PayPal when tab is clicked
      if (target === "paypal") loadAndRenderPayPal();
    });
  });

  // ── STRIPE ────────────────────────────────────────────────────────────────
  let stripe,
    cardElement,
    cardMounted = false;
  const stripePayBtn = document.getElementById("stripe-pay-btn");
  const cardErrors = document.getElementById("stripe-card-errors");
  const cardMount = document.getElementById("stripe-card-element");

  function mountStripeCard() {
    if (cardMounted || !cardMount) return;

    injectCaptcha("stripe-pay-btn", "stripe");

    const keyIsReal =
      STRIPE_PUBLISHABLE_KEY && !STRIPE_PUBLISHABLE_KEY.startsWith("YOUR_");

    if (!keyIsReal) {
      cardMount.innerHTML =
        '<p class="text-yellow-500 text-xs py-1">⚠️ Add your Stripe Publishable Key and Price ID in checkout.js to activate secure payments.</p>';
      return;
    }

    if (typeof Stripe === "undefined") {
      cardMount.innerHTML =
        '<p class="text-red-400 text-xs py-1">Stripe failed to load. Check your internet connection.</p>';
      return;
    }

    stripe = Stripe(STRIPE_PUBLISHABLE_KEY);
    // Using Stripe Checkout Redirect, so we just display a message here instead of the Card Element
    cardMount.innerHTML =
      '<p class="text-gray-300 text-sm py-4 text-center">You will be redirected to the secure Stripe Checkout page to complete your purchase.</p>';
    cardMounted = true;
  }

  if (stripePayBtn) {
    stripePayBtn.addEventListener("click", async () => {
      let stripeCheck = document.getElementById("robot-check-stripe");
      if (stripeCheck && !stripeCheck.checked) {
        const box = stripeCheck.closest(".captcha-container");
        box.classList.add("border-red-500");
        setTimeout(() => box.classList.remove("border-red-500"), 2000);
        showMsg("Please verify you are not a robot.", "error");
        return;
      }

      const keyIsReal =
        STRIPE_PUBLISHABLE_KEY &&
        !STRIPE_PUBLISHABLE_KEY.startsWith("YOUR_") &&
        STRIPE_PRICE_ID &&
        !STRIPE_PRICE_ID.startsWith("YOUR_");
      if (!keyIsReal) {
        showMsg(
          "⚠️ Add your Stripe Publishable Key AND Price ID in checkout.js to process payments.",
          "warn",
        );
        return;
      }

      setBtnLoading(stripePayBtn, true);

      const qty = qtyInput ? Math.max(1, parseInt(qtyInput.value) || 1) : 1;

      // Redirect securely to Stripe Hosted Checkout
      stripe
        .redirectToCheckout({
          lineItems: [{ price: STRIPE_PRICE_ID, quantity: qty }],
          mode: "payment",
          successUrl:
            window.location.origin + window.location.pathname + "?success=true",
          cancelUrl:
            window.location.origin +
            window.location.pathname +
            "?canceled=true",
        })
        .then(function (result) {
          if (result.error) {
            showMsg(result.error.message, "error");
            setBtnLoading(stripePayBtn, false);
          }
        });
    });
  }

  // ── PAYPAL ────────────────────────────────────────────────────────────────
  let paypalRendered = false;

  function loadAndRenderPayPal() {
    const container = document.getElementById("paypal-button-container");
    if (!container) return;

    const keyIsReal = PAYPAL_CLIENT_ID && !PAYPAL_CLIENT_ID.startsWith("YOUR_");

    if (!keyIsReal) {
      container.innerHTML =
        '<p class="text-yellow-500 text-xs text-center py-4">⚠️ Add your PayPal Client ID in checkout.js to activate PayPal payments.</p>';
      return;
    }

    // Already rendered
    if (paypalRendered) return;

    // Load PayPal SDK dynamically
    if (typeof paypal === "undefined") {
      const script = document.createElement("script");
      script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=CAD`;
      script.onload = () => renderPayPalButton(container);
      script.onerror = () => {
        container.innerHTML =
          '<p class="text-red-400 text-xs text-center py-4">PayPal failed to load. Check your Client ID.</p>';
      };
      document.head.appendChild(script);
    } else {
      renderPayPalButton(container);
    }
  }

  function renderPayPalButton(container) {
    if (paypalRendered) return;
    paypalRendered = true;

    let paypalCheck = injectCaptcha("paypal-button-container", "paypal");

    const qty = qtyInput ? Math.max(1, parseInt(qtyInput.value) || 1) : 1;
    const total = (qty * PRICE_PER_PACK).toFixed(2);

    paypal
      .Buttons({
        style: {
          layout: "vertical",
          color: "gold",
          shape: "rect",
          label: "pay",
          height: 48,
        },
        onInit: function (data, actions) {
          actions.disable();
          if (paypalCheck) {
            paypalCheck.addEventListener("change", function (e) {
              if (e.target.checked) actions.enable();
              else actions.disable();
            });
          }
        },
        onClick: function () {
          if (paypalCheck && !paypalCheck.checked) {
            const box = paypalCheck.closest(".captcha-container");
            box.classList.add("border-red-500");
            setTimeout(() => box.classList.remove("border-red-500"), 2000);
            showMsg("Please verify you are not a robot.", "error");
          }
        },
        createOrder: (data, actions) =>
          actions.order.create({
            purchase_units: [
              {
                description: `Taprobane Lager Pack ×${qty}`,
                amount: { currency_code: "CAD", value: total },
              },
            ],
          }),
        onApprove: (data, actions) =>
          actions.order.capture().then(() => showSuccessScreen(panel)),
        onError: (err) => {
          console.error("PayPal error:", err);
          showMsg("PayPal encountered an error. Please try again.", "error");
        },
      })
      .render("#paypal-button-container");
  }

  // ── HELPERS ───────────────────────────────────────────────────────────────
  function injectCaptcha(containerId, uniquePrefix) {
    const container = document.getElementById(containerId);
    if (!container) return null;
    let captchaBox = document.getElementById(`captcha-box-${uniquePrefix}`);
    if (!captchaBox) {
      captchaBox = document.createElement("div");
      captchaBox.id = `captcha-box-${uniquePrefix}`;
      captchaBox.className =
        "captcha-container flex items-center justify-between p-4 bg-dark-bg border border-white/10 rounded-sm mb-6 transition-colors duration-300";
      captchaBox.innerHTML = `
                <div class="flex items-center gap-3">
                    <input type="checkbox" id="robot-check-${uniquePrefix}" class="w-6 h-6 bg-dark-surface border border-white/20 rounded-sm focus:ring-gold text-gold cursor-pointer accent-gold robot-check gap-2">
                    <label for="robot-check-${uniquePrefix}" class="text-sm text-gray-300 uppercase tracking-widest cursor-pointer select-none">I'm not a robot</label>
                </div>
                <div class="flex flex-col items-center">
                    <img src="https://www.gstatic.com/recaptcha/api2/logo_48.png" alt="reCAPTCHA" class="w-8 h-8 opacity-80 mb-1" onerror="this.style.display='none'">
                    <span class="text-[8px] text-gray-500 uppercase tracking-wider">reCAPTCHA</span>
                </div>
            `;
      container.parentElement.insertBefore(captchaBox, container);
    }
    return captchaBox.querySelector(".robot-check");
  }

  function showSuccessScreen(panelEl) {
    panelEl.innerHTML = `
            <div class="h-1 w-full bg-gradient-to-r from-transparent via-gold to-transparent"></div>
            <div class="flex flex-col items-center justify-center py-16 px-8 text-center">
                <div class="w-20 h-20 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(212,175,55,0.2)]">
                    <svg class="w-10 h-10 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 13l4 4L19 7"/>
                    </svg>
                </div>
                <h2 class="font-heading text-3xl font-bold text-white mb-3">Order Confirmed!</h2>
                <p class="text-gray-400 text-sm font-light mb-2">Thank you for choosing Taprobane Lager.</p>
                <p class="text-gray-500 text-xs mb-10">A confirmation will be sent to your email shortly.</p>
                <button onclick="window.closeCheckoutModal()" class="bg-gold text-black px-10 py-3 text-xs font-bold uppercase tracking-[0.2em] hover:bg-white transition-all duration-300 rounded-sm">
                    Continue Shopping
                </button>
            </div>`;
  }

  function showMsg(text, type = "error") {
    const existing = document.getElementById("checkout-msg");
    if (existing) existing.remove();
    const el = document.createElement("p");
    el.id = "checkout-msg";
    el.className = `text-xs mt-3 text-center ${type === "warn" ? "text-yellow-400" : "text-red-400"}`;
    el.textContent = text;
    stripePayBtn?.insertAdjacentElement("afterend", el);
    setTimeout(() => el?.remove(), 6000);
  }

  function setBtnLoading(btn, loading) {
    if (!btn) return;
    btn.disabled = loading;
    btn.innerHTML = loading
      ? `<svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg> Processing...`
      : `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg> Pay Securely`;
  }
}); // end DOMContentLoaded
