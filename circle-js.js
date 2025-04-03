// ----------------------------------------------
// 🔹 Cancer Delta Custom Script for Circle.so (SPA-Safe Bootloader)
// ----------------------------------------------

console.log("✅ Cancer Delta script loader booting");

// Optional: capture runtime errors
window.onerror = function (message, source, lineno, colno, error) {
  console.error("🚨 Script error:", message, source, lineno, colno, error);
};

// Wait for Circle's app shell to fully load before running any enhancements
function waitForCircleAppReady(callback, maxRetries = 50) {
  let retries = 0;
  const checkInterval = setInterval(() => {
    const appRoot = document.querySelector('[data-testid="community-content"]');
    if (appRoot) {
      console.log("✅ Circle app detected, launching enhancements");
      clearInterval(checkInterval);
      callback();
    } else if (++retries > maxRetries) {
      console.warn("❌ Circle app never fully loaded");
      clearInterval(checkInterval);
    }
  }, 300);
}

// 🧠 Main Enhancer
waitForCircleAppReady(() => {
  const TARGET_BOT_PREFIX = "https://search.cancerdelta.ai/messages/bot/";
  const SIGNUP_URL = "https://app.cancerdelta.ai/sign_up";
  const INTERNAL_DOMAIN = "cholangio.cancerdelta.app";

  function isUserLoggedOut() {
    return document.body.classList.contains("is-signed-out");
  }
  function isUserAdmin() {
    return window.circleUser?.isAdmin === "true";
  }

  function updateSearchPopupUI() {
    const loggedOut = isUserLoggedOut();
    const emptySearch = document.querySelector('[data-testid="empty-search"]');
    const input = document.querySelector('input[type="search"]');

    if (input) {
      input.setAttribute(
        "placeholder",
        loggedOut
          ? "Search Cancer Delta"
          : "Search or ask Delta AI a question"
      );
    }

    if (!emptySearch) {
      setTimeout(updateSearchPopupUI, 200);
      return;
    }

    const existingIcon = emptySearch.querySelector("svg.icon-24-search-v2");
    const alreadyHasLogo = emptySearch.querySelector(".delta-popup-logo");
    if (existingIcon && !alreadyHasLogo) {
      const logo = document.createElement("img");
      logo.src = "https://www.cancerdelta.ai/images/icon.png";
      logo.alt = "Delta AI Logo";
      logo.className = "delta-popup-logo";
      logo.style.width = "40px";
      logo.style.height = "40px";
      logo.style.margin = "0 auto";
      existingIcon.replaceWith(logo);
    }

    const headings = emptySearch.querySelectorAll("h1, h2, h3, h4, h5");
    headings.forEach((heading) => {
      if (!heading.dataset.deltaInjected) {
        heading.textContent = loggedOut
          ? "Join Cancer Delta to Unlock Delta AI"
          : "Ask Delta AI or Search the Community";
        heading.dataset.deltaInjected = "true";
      }

      const subtext = heading.nextElementSibling;
      if (subtext && !subtext.dataset.deltaInjected) {
        subtext.innerHTML = loggedOut
          ? `Sign up now to access Delta AI's insights, expert content, and community support.<br><br>
            <button onclick="window.location.href='${SIGNUP_URL}'"
              class="focus-visible:!outline-secondary font-bold transition-colors duration-200 focus-visible:!outline focus-visible:!outline-2 focus-visible:!outline-offset-2 disabled:cursor-not-allowed px-8 py-3 w-full rounded-full bg-brand text-brand-button disabled:bg-disabled transition-opacity hover:opacity-90">
              Join Cancer Delta Community
            </button>`
          : `Get quick answers powered by AI, or explore insights from members, toolkits, discussions, and expert content across Cancer Delta.<br><br>
            <em>I’m Delta AI, with a focus on Cholangiocarcinoma for now. I’ll be expanding to support other cancers in future updates to better serve our community.</em>`;
        subtext.dataset.deltaInjected = "true";
      }
    });
  }

  function watchAskDeltaAIPopup() {
    document.body.addEventListener("click", (e) => {
      const btn = e.target.closest("button");
      if (!btn) return;

      const label = btn.textContent?.trim().toLowerCase();
      const aria = btn.getAttribute("aria-label")?.toLowerCase();

      if (label === "ask delta ai" || aria === "ask delta ai") {
        const waitForSearchUI = () => {
          const container = document.querySelector('[data-testid="empty-search"]');
          if (container) {
            updateSearchPopupUI();
          } else {
            setTimeout(waitForSearchUI, 100);
          }
        };
        waitForSearchUI();
      }
    });
  }

  let hasInterceptedBotLinks = false;
  function setupLinkInterceptor() {
    if (hasInterceptedBotLinks) return;
    hasInterceptedBotLinks = true;

    document.body.addEventListener("click", function (e) {
      const isEditing = e.target.closest('svg.icon-menu-dots-v2') ||
        ["edit", "delete"].includes(e.target.closest("button")?.textContent?.trim().toLowerCase());
      if (isEditing) return;

      const link = e.target.closest("a");
      if (!link) return;

      const href = link.href;
      if (href?.startsWith(TARGET_BOT_PREFIX)) {
        e.preventDefault();
        const buttons = Array.from(document.querySelectorAll("button"));
        const searchButton = buttons.find(btn => btn.textContent.trim() === "Search");
        if (searchButton) searchButton.click();
      }
    });
  }

  function hideJoinButtonIfNeeded() {
    const shouldHide = !isUserLoggedOut() && !isUserAdmin();
    if (!shouldHide) return;

    const joinLinks = document.querySelectorAll('a[href*="/sign_up"]');
    joinLinks.forEach(link => {
      if (link.textContent?.trim().toLowerCase().includes("join the community")) {
        link.style.display = "none";
      }
    });
  }

  function renameAgentsTab() {
    document.querySelectorAll('[data-testid="tab-button"] span').forEach(span => {
      const div = span.querySelector('div');
      if (div && div.textContent.trim() === 'Agents') {
        const svg = div.querySelector('svg');
        div.innerHTML = '';
        if (svg) div.appendChild(svg);
        div.append('Delta AI');
      }
    });
  }

  function simplifyMemberSinceTags() {
    document.querySelectorAll('div.text-light.flex.text-xs').forEach(el => {
      if (el.textContent.trim().startsWith("Member since")) {
        el.textContent = "Member";
      }
    });

    document.querySelectorAll('[data-testid="profile-member-since"]').forEach(container => {
      const span = container.querySelector("span");
      const p = container.querySelector("p");

      if (span && span.textContent.includes("Member since")) {
        span.textContent = "Member";
      }
      if (p && p.textContent.includes("Member since")) {
        p.textContent = "Member";
      }
    });
  }

  function fixTiptapCTALinks() {
    document.querySelectorAll('a.tiptap-cta[target="_blank"]').forEach(link => {
      const url = new URL(link.href, window.location.origin);
      if (url.hostname.includes(INTERNAL_DOMAIN)) {
        link.removeAttribute("target");
        link.removeAttribute("rel");
      }
    });
  }

  function debounceObserver(callback, delay = 300) {
    let lastRun = 0;
    return function (...args) {
      const now = Date.now();
      if (now - lastRun > delay) {
        lastRun = now;
        callback(...args);
      }
    };
  }

  const applyEnhancements = () => {
    updateSearchPopupUI();
    hideJoinButtonIfNeeded();
    renameAgentsTab();
    simplifyMemberSinceTags();
    fixTiptapCTALinks();
    setupLinkInterceptor();
  };

  applyEnhancements();
  watchAskDeltaAIPopup();

  const observer = new MutationObserver(debounceObserver(applyEnhancements, 300));
  observer.observe(document.body, { childList: true, subtree: true });
});
