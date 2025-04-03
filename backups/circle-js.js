// ----------------------------------------------
// 🔹 Cancer Delta Custom Script for Circle.so (Optimized)
// ----------------------------------------------

const TARGET_BOT_PREFIX = "https://search.cancerdelta.ai/messages/bot/";
const SIGNUP_URL = "https://app.cancerdelta.ai/sign_up";
const INTERNAL_DOMAIN = "cholangio.cancerdelta.app";

// ---------------------------
// Utility: User status checks
// ---------------------------
function isUserLoggedOut() {
  return document.body.classList.contains("is-signed-out");
}
function isUserAdmin() {
  return window.circleUser?.isAdmin === "true";
}

// ---------------------------
// UI: Update search popup
// ---------------------------
function updateSearchPopupUI() {
  const input = document.querySelector('input[placeholder="Search or ask a question"]');
  const emptySearch = document.querySelector('[data-testid="empty-search"]');
  const loggedOut = isUserLoggedOut();

  if (input) {
    input.placeholder = loggedOut ? "Search Cancer Delta" : "Search or ask Delta AI a question";
  }

  if (emptySearch) {
    const centerSVG = emptySearch.querySelector("svg.icon-24-search-v2");
    if (centerSVG && !emptySearch.querySelector(".delta-popup-logo")) {
      const logo = document.createElement("img");
      logo.src = "https://www.cancerdelta.ai/images/icon.png";
      logo.alt = "Delta AI Logo";
      logo.className = "delta-popup-logo";
      logo.style.width = "40px";
      logo.style.height = "40px";
      centerSVG.replaceWith(logo);
    }

    const heading = emptySearch.querySelector("h1, h2, h5");
    if (heading) {
      heading.textContent = loggedOut
        ? "Join Cancer Delta to Unlock Delta AI"
        : "Ask Delta AI or Search the Community";
    }

    const subtext = heading?.nextElementSibling;
    if (subtext) {
      subtext.innerHTML = loggedOut
        ? `<br>Sign up now to access Delta AI's insights, expert content, and community support.<br><br>
            <button onclick="window.location.href='${SIGNUP_URL}'"
              class="focus-visible:!outline-secondary font-bold transition-colors duration-200 focus-visible:!outline focus-visible:!outline-2 focus-visible:!outline-offset-2 disabled:cursor-not-allowed px-8 py-3 w-full rounded-full bg-brand text-brand-button disabled:bg-disabled transition-opacity hover:opacity-90">
              Join Cancer Delta Community
            </button>`
        : `Get quick answers powered by AI, or explore insights from members, toolkits, discussions, and expert content across Cancer Delta.<br><br>
          <em>I’m Delta AI, with a focus on Cholangiocarcinoma for now. I’ll be expanding to support other cancers in future updates to better serve our community.</em>`;
    }
  }

  const wrapper = input?.closest("div");
  if (wrapper && !loggedOut) {
    const leftIcon = wrapper.querySelector("svg.icon-search-v2");
    if (leftIcon && !wrapper.querySelector(".delta-searchbar-icon")) {
      const img = document.createElement("img");
      img.src = "https://www.cancerdelta.ai/images/icon_circle.png";
      img.alt = "Delta AI Icon";
      img.className = "delta-searchbar-icon";
      img.style.width = "22px";
      img.style.height = "22px";
      img.style.objectFit = "contain";
      leftIcon.replaceWith(img);
    }
  }
}

// ---------------------------
// Intercept links to Delta AI bot
// ---------------------------
function setupLinkInterceptor() {
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

// ---------------------------
// Hide "Join the Community" if logged in
// ---------------------------
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

// ---------------------------
// Rename "Agents" tab
// ---------------------------
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

// ---------------------------
// Simplify "Member since" to "Member"
// ---------------------------
function simplifyMemberSinceTags() {
  // 1. In-post metadata
  document.querySelectorAll('div.text-light.flex.text-xs').forEach(el => {
    if (el.textContent.trim().startsWith("Member since")) {
      el.textContent = "Member";
    }
  });

  // 2. Profile metadata
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

// ---------------------------
// Fix TipTap CTA links (internal = same tab, external = new tab)
// ---------------------------
function fixTiptapCTALinks() {
  document.querySelectorAll('a.tiptap-cta[target="_blank"]').forEach(link => {
    const url = new URL(link.href, window.location.origin);
    if (url.hostname.includes(INTERNAL_DOMAIN)) {
      link.removeAttribute("target");
      link.removeAttribute("rel");
    }
  });
}

// ---------------------------
// Debounced Mutation Observer
// ---------------------------
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

// ---------------------------
// Boot MutationObserver
// ---------------------------
const sharedObserver = new MutationObserver(
  debounceObserver(() => {
    updateSearchPopupUI();
    hideJoinButtonIfNeeded();
    renameAgentsTab();
    simplifyMemberSinceTags();
    fixTiptapCTALinks();

    const searchBtnExists = !!Array.from(document.querySelectorAll("button"))
      .find(btn => btn.textContent.trim() === "Search");
    if (searchBtnExists) setupLinkInterceptor();
  }, 300)
);

sharedObserver.observe(document.body, { childList: true, subtree: true });
