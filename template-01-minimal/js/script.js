/**
 * Template 01 — Refined Minimal
 * Sidebar drawer, navbar dropdown, overlay. No inline handlers.
 */

(function () {
  "use strict";

  var menuBtn = document.getElementById("menu-btn");
  var sidebar = document.getElementById("sidebar");
  var sidebarOverlay = document.getElementById("sidebar-overlay");
  var userTrigger = document.getElementById("user-trigger");
  var userDropdown = document.getElementById("user-dropdown");

  function openSidebar() {
    if (sidebar) sidebar.classList.add("is-open");
    if (sidebarOverlay) {
      sidebarOverlay.classList.add("is-visible");
      sidebarOverlay.setAttribute("aria-hidden", "false");
    }
    if (menuBtn) {
      menuBtn.setAttribute("aria-expanded", "true");
    }
  }

  function closeSidebar() {
    if (sidebar) sidebar.classList.remove("is-open");
    if (sidebarOverlay) {
      sidebarOverlay.classList.remove("is-visible");
      sidebarOverlay.setAttribute("aria-hidden", "true");
    }
    if (menuBtn) {
      menuBtn.setAttribute("aria-expanded", "false");
    }
  }

  function toggleSidebar() {
    var isOpen = sidebar && sidebar.classList.contains("is-open");
    if (isOpen) closeSidebar();
    else openSidebar();
  }

  function toggleUserDropdown() {
    var isOpen = userDropdown && userDropdown.classList.contains("is-open");
    if (userDropdown) {
      userDropdown.classList.toggle("is-open", !isOpen);
      if (userTrigger) userTrigger.setAttribute("aria-expanded", !isOpen);
    }
  }

  function closeUserDropdown() {
    if (userDropdown) userDropdown.classList.remove("is-open");
    if (userTrigger) userTrigger.setAttribute("aria-expanded", "false");
  }

  if (menuBtn) {
    menuBtn.addEventListener("click", function () {
      toggleSidebar();
    });
  }

  if (sidebarOverlay) {
    sidebarOverlay.addEventListener("click", function () {
      closeSidebar();
    });
  }

  if (userTrigger && userDropdown) {
    userTrigger.addEventListener("click", function (e) {
      e.stopPropagation();
      toggleUserDropdown();
    });
  }

  document.addEventListener("click", function () {
    closeUserDropdown();
  });

  if (userDropdown) {
    userDropdown.addEventListener("click", function (e) {
      e.stopPropagation();
    });
  }
})();
