/**
 * Applications page — 5 dummy records, UI-only filters, star/row/actions functional.
 * No fetch; no URL state; filters do not filter data.
 */
(function () {
  "use strict";

  var APPLICATIONS = [
    {
      id: 9,
      candidateName: "Arpit Mittal 1",
      email: "arpitmittal4@gmail.com",
      phone: "9999999994",
      noticePeriod: "15 Days",
      currentCTC: "28",
      graduationYear: 2021,
      totalExperience: 5,
      aiRelevancyScore: 95,
      cloudExperience: "AWS, GCP, Azure",
      skills: [],
      aiExtractionStatus: "Completed",
      assignee: "illias@kubenine.com",
      finalStatus: "Applied",
      isStarred: false
    },
    {
      id: "app-001",
      candidateName: "Priya Sharma",
      email: "priya.sharma@email.com",
      phone: "+91 98765 43210",
      noticePeriod: "1 month",
      currentCTC: "14 LPA",
      graduationYear: 2019,
      totalExperience: 5,
      aiRelevancyScore: 87,
      cloudExperience: "AWS",
      skills: ["Java", "Spring Boot", "Kubernetes", "Docker", "Microservices"],
      aiExtractionStatus: "Completed",
      assignee: "Rahul Mehta",
      finalStatus: "Interview",
      isStarred: true
    },
    {
      id: "app-002",
      candidateName: "Arjun Patel",
      email: "arjun.patel@email.com",
      phone: "+91 91234 56789",
      noticePeriod: "15 days",
      currentCTC: "18 LPA",
      graduationYear: 2018,
      totalExperience: 6,
      aiRelevancyScore: 92,
      cloudExperience: "AWS",
      skills: ["Python", "Go", "Terraform", "AWS", "CI/CD"],
      aiExtractionStatus: "Completed",
      assignee: "Sneha Reddy",
      finalStatus: "Offer",
      isStarred: true
    },
    {
      id: "app-003",
      candidateName: "Meera Krishnan",
      email: "meera.k@email.com",
      phone: "+91 99887 66554",
      noticePeriod: "2 months",
      currentCTC: "10 LPA",
      graduationYear: 2021,
      totalExperience: 3,
      aiRelevancyScore: 45,
      cloudExperience: "GCP",
      skills: ["JavaScript", "Node.js", "React", "MongoDB"],
      aiExtractionStatus: "Completed",
      assignee: "Rahul Mehta",
      finalStatus: "Screening",
      isStarred: false
    },
    {
      id: "app-004",
      candidateName: "Vikram Singh",
      email: "vikram.singh@email.com",
      phone: "+91 87654 32109",
      noticePeriod: "Immediate",
      currentCTC: "22 LPA",
      graduationYear: 2016,
      totalExperience: 8,
      aiRelevancyScore: 78,
      cloudExperience: "Azure",
      skills: [".NET", "C#", "Azure", "SQL Server", "Redis"],
      aiExtractionStatus: "Completed",
      assignee: "Sneha Reddy",
      finalStatus: "Selected",
      isStarred: true
    },
    {
      id: "app-005",
      candidateName: "Ananya Desai",
      email: "ananya.d@email.com",
      phone: "+91 76543 21098",
      noticePeriod: "1 month",
      currentCTC: "9 LPA",
      graduationYear: 2022,
      totalExperience: 2,
      aiRelevancyScore: 0,
      cloudExperience: "None",
      skills: ["HTML", "CSS", "JavaScript", "Bootstrap"],
      aiExtractionStatus: "Failed",
      assignee: "Unassigned",
      finalStatus: "New",
      isStarred: false
    }
  ];

  var PAGE_SIZE = 25;
  var ROW_PLACEHOLDER_URL = "../application-detail/index.html?id=";

  var state = {
    page: 1,
    pageSize: PAGE_SIZE,
    selectedIds: new Set(),
    density: "comfortable",
    columnVisibility: {
      aiExtractionStatus: true
    }
  };

  function escapeHtml(str) {
    if (str == null) return "";
    var div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function aiScoreClass(score) {
    if (score == null || score === 0) return "ai-score-badge--zero";
    if (score >= 71) return "ai-score-badge--high";
    if (score >= 41) return "ai-score-badge--mid";
    return "ai-score-badge--low";
  }

  function statusClass(status) {
    if (!status) return "";
    var s = String(status).toLowerCase();
    if (s === "new") return "status-badge--new";
    if (s === "screening") return "status-badge--screening";
    if (s === "interview") return "status-badge--interview";
    if (s === "offer") return "status-badge--offer";
    if (s === "selected") return "status-badge--selected";
    if (s === "rejected") return "status-badge--rejected";
    return "status-badge--new";
  }

  function buildRow(app) {
    var id = app.id;
    var tr = document.createElement("tr");
    tr.dataset.id = id;
    if (app.finalStatus === "Rejected") tr.classList.add("row--dimmed");
    if (app.aiRelevancyScore === 0) tr.classList.add("row--highlight-ai-zero");

    var score = app.aiRelevancyScore != null ? app.aiRelevancyScore : 0;
    var scoreTitle = "AI Relevancy Score: " + score + "/100";

    tr.innerHTML =
      '<td class="cell--select"><input type="checkbox" class="row-select" data-id="' + escapeHtml(id) + '" aria-label="Select row"></td>' +
      '<td class="cell--name"><a href="' + ROW_PLACEHOLDER_URL + encodeURIComponent(id) + '">' + escapeHtml(app.candidateName || "") + "</a></td>" +
      '<td class="cell--exp">' + escapeHtml(app.totalExperience != null ? app.totalExperience + " yr" : "—") + "</td>" +
      '<td class="cell--notice">' + escapeHtml(app.noticePeriod || "—") + "</td>" +
      '<td class="cell--ai"><span class="ai-score-badge ' + aiScoreClass(score) + '" title="' + escapeHtml(scoreTitle) + '">' + score + "</span></td>" +
      '<td class="cell--assignee">' + escapeHtml(app.assignee || "—") + "</td>" +
      '<td class="cell--status"><span class="status-badge ' + statusClass(app.finalStatus) + '">' + escapeHtml(app.finalStatus || "—") + "</span></td>" +
      '<td class="col--secondary cell--ai-status" data-col="aiExtractionStatus">' + escapeHtml(app.aiExtractionStatus || "—") + "</td>" +
      '<td class="cell--actions"><div class="row-actions-wrap">' +
      '<button type="button" class="row-actions-btn" data-id="' + escapeHtml(id) + '" aria-label="More actions" aria-expanded="false" aria-haspopup="true">⋯</button>' +
      '<div class="row-actions-dropdown" role="menu" aria-label="Row actions">' +
      '<button type="button" class="row-actions-item" role="menuitem" data-action="view">View</button>' +
      '<button type="button" class="row-actions-item" role="menuitem" data-action="move">Move</button>' +
      '<button type="button" class="row-actions-item" role="menuitem" data-action="reject">Reject</button>' +
      '<button type="button" class="row-actions-item" role="menuitem" data-action="assign">Assign</button>' +
      "</div></div></td>";

    return tr;
  }

  function buildCard(app) {
    var id = app.id;
    var card = document.createElement("div");
    card.className = "application-card";
    card.dataset.id = id;
    if (app.finalStatus === "Rejected") card.classList.add("row--dimmed");
    if (app.aiRelevancyScore === 0) card.classList.add("row--highlight-ai-zero");

    var score = app.aiRelevancyScore != null ? app.aiRelevancyScore : 0;
    card.innerHTML =
      '<div class="application-card__header">' +
      '<a href="' + ROW_PLACEHOLDER_URL + encodeURIComponent(id) + '" class="application-card__name">' + escapeHtml(app.candidateName || "") + "</a>" +
      "</div>" +
      '<div class="application-card__meta">' +
      '<div class="application-card__meta-row"><span>Experience: ' + escapeHtml(app.totalExperience != null ? app.totalExperience + " yr" : "—") + "</span><span>Notice: " + escapeHtml(app.noticePeriod || "—") + "</span></div>" +
      '<div class="application-card__meta-row"><span>AI Score: ' + score + "</span><span>" + escapeHtml(app.assignee || "—") + "</span></div>" +
      "</div>" +
      '<div class="application-card__badges">' +
      '<span class="status-badge ' + statusClass(app.finalStatus) + '">' + escapeHtml(app.finalStatus || "—") + "</span>" +
      "</div>";
    return card;
  }

  function updateStats() {
    var total = APPLICATIONS.length;
    var rejected = APPLICATIONS.filter(function (r) { return r.finalStatus === "Rejected"; }).length;
    var selected = APPLICATIONS.filter(function (r) { return r.finalStatus === "Selected"; }).length;
    var active = total - rejected;
    var el;
    if ((el = document.getElementById("stat-total"))) el.textContent = total;
    if ((el = document.getElementById("stat-active"))) el.textContent = active;
    if ((el = document.getElementById("stat-selected"))) el.textContent = selected;
    if ((el = document.getElementById("stat-rejected"))) el.textContent = rejected;
  }

  function applyColumnVisibility() {
    var vis = state.columnVisibility;
    document.querySelectorAll(".col--secondary[data-col]").forEach(function (el) {
      var col = el.getAttribute("data-col");
      el.classList.toggle("is-hidden", !vis[col]);
    });
    document.querySelectorAll("th.col--secondary[data-col]").forEach(function (el) {
      var col = el.getAttribute("data-col");
      el.classList.toggle("is-hidden", !vis[col]);
    });
  }

  function applyDensity() {
    var wrapper = document.getElementById("table-wrapper");
    if (wrapper) wrapper.classList.toggle("table-wrapper--compact", state.density === "compact");
  }

  function updatePagination() {
    var total = APPLICATIONS.length;
    var start = (state.page - 1) * state.pageSize + 1;
    var end = Math.min(state.page * state.pageSize, total);
    var info = document.getElementById("pagination-info");
    if (info) info.textContent = "Showing " + (total ? start : 0) + "–" + end + " of " + total;

    var totalPages = Math.max(1, Math.ceil(total / state.pageSize));
    var prev = document.getElementById("pagination-prev");
    var next = document.getElementById("pagination-next");
    if (prev) prev.disabled = state.page <= 1;
    if (next) next.disabled = state.page >= totalPages;
  }

  function updateBulkUI() {
    var bulkActions = document.getElementById("bulk-actions");
    if (bulkActions) bulkActions.classList.toggle("is-visible", state.selectedIds.size > 0);
  }

  function render() {
    var total = APPLICATIONS.length;
    var start = (state.page - 1) * state.pageSize;
    var pageRows = APPLICATIONS.slice(start, start + state.pageSize);
    var isMobile = window.innerWidth < 768;

    updateStats();
    updatePagination();
    updateBulkUI();
    applyColumnVisibility();
    applyDensity();

    var tableWrapper = document.getElementById("table-wrapper");
    var emptyState = document.getElementById("empty-state");
    var errorState = document.getElementById("error-state");
    var paginationEl = document.getElementById("pagination");

    if (errorState) errorState.classList.remove("is-visible");
    if (total === 0) {
      var tbody = document.getElementById("applications-tbody");
      var cardsContainer = document.getElementById("applications-cards");
      if (tbody) tbody.innerHTML = "";
      if (cardsContainer) cardsContainer.innerHTML = "";
      if (tableWrapper) tableWrapper.classList.add("table-wrapper--empty");
      if (emptyState) emptyState.classList.add("is-visible");
      if (paginationEl) paginationEl.style.visibility = "hidden";
      return;
    }

    if (emptyState) emptyState.classList.remove("is-visible");
    if (tableWrapper) tableWrapper.classList.remove("table-wrapper--empty");
    if (paginationEl) paginationEl.style.visibility = "visible";

    if (isMobile) {
      if (tableWrapper) tableWrapper.classList.add("table-wrapper--mobile-hidden");
      var cardsContainer = document.getElementById("applications-cards");
      if (cardsContainer) {
        cardsContainer.classList.add("is-visible");
        cardsContainer.innerHTML = "";
        pageRows.forEach(function (app) {
          cardsContainer.appendChild(buildCard(app));
        });
      }
      var tbody = document.getElementById("applications-tbody");
      if (tbody) tbody.innerHTML = "";
    } else {
      var cardsContainer = document.getElementById("applications-cards");
      if (cardsContainer) cardsContainer.classList.remove("is-visible");
      var tbody = document.getElementById("applications-tbody");
      if (tbody) {
        tbody.innerHTML = "";
        pageRows.forEach(function (app) {
          tbody.appendChild(buildRow(app));
        });
      }
    }

    bindRowEvents();
  }

  function bindRowEvents() {
    document.querySelectorAll(".row-select").forEach(function (cb) {
      cb.checked = state.selectedIds.has(cb.dataset.id);
      cb.addEventListener("change", function () {
        var id = cb.dataset.id;
        if (cb.checked) state.selectedIds.add(id);
        else state.selectedIds.delete(id);
        updateBulkUI();
        var thAll = document.getElementById("th-select-all");
        var bulkAll = document.getElementById("bulk-select-all");
        if (thAll) thAll.checked = state.selectedIds.size === document.querySelectorAll(".row-select").length;
        if (bulkAll) bulkAll.checked = thAll && thAll.checked;
      });
    });

    document.querySelectorAll(".cell--name a, .application-card__name").forEach(function (link) {
      link.addEventListener("click", function (e) { e.stopPropagation(); });
    });

    document.querySelectorAll(".application-card").forEach(function (card) {
      card.addEventListener("click", function (e) {
        if (e.target.closest("a") || e.target.closest("button")) return;
        var id = card.dataset.id;
        if (id) window.location.href = ROW_PLACEHOLDER_URL + encodeURIComponent(id);
      });
    });

    document.querySelectorAll("#applications-tbody tr").forEach(function (tr) {
      tr.addEventListener("click", function (e) {
        if (e.target.closest("input") || e.target.closest("button") || e.target.closest("a")) return;
        var id = tr.dataset.id;
        if (id) window.location.href = ROW_PLACEHOLDER_URL + encodeURIComponent(id);
      });
    });

    document.querySelectorAll(".row-actions-btn").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        var wrap = btn.closest(".row-actions-wrap");
        var panel = wrap && wrap.querySelector(".row-actions-dropdown");
        if (!panel) return;
        var isOpen = panel.classList.contains("is-open");
        document.querySelectorAll(".row-actions-dropdown").forEach(function (p) { p.classList.remove("is-open"); });
        document.querySelectorAll(".row-actions-btn").forEach(function (b) { b.setAttribute("aria-expanded", "false"); });
        if (!isOpen) {
          panel.classList.add("is-open");
          btn.setAttribute("aria-expanded", "true");
        }
      });
    });

    document.querySelectorAll(".row-actions-item").forEach(function (item) {
      item.addEventListener("click", function (e) {
        e.stopPropagation();
        var wrap = item.closest(".row-actions-wrap");
        var row = wrap && wrap.closest("tr");
        var id = row && row.dataset.id;
        var action = item.getAttribute("data-action");
        var panel = wrap && wrap.querySelector(".row-actions-dropdown");
        if (panel) panel.classList.remove("is-open");
        if (wrap) {
          var b = wrap.querySelector(".row-actions-btn");
          if (b) b.setAttribute("aria-expanded", "false");
        }
        if (action === "view" && id) {
          window.location.href = ROW_PLACEHOLDER_URL + encodeURIComponent(id);
        } else if (action === "move" || action === "assign") {
          if (id) return; /* no-op or optional alert for demo */
        } else if (action === "reject" && id) {
          var app = APPLICATIONS.find(function (a) { return String(a.id) === String(id); });
          if (app) {
            app.finalStatus = "Rejected";
            render();
          }
        }
      });
    });
  }

  function bindGlobalEvents() {
    document.addEventListener("click", function (e) {
      if (!e.target.closest(".row-actions-wrap")) {
        document.querySelectorAll(".row-actions-dropdown").forEach(function (p) { p.classList.remove("is-open"); });
        document.querySelectorAll(".row-actions-btn").forEach(function (b) { b.setAttribute("aria-expanded", "false"); });
      }
    });

    var menuBtn = document.getElementById("menu-btn");
    var sidebar = document.getElementById("sidebar");
    var overlay = document.getElementById("sidebar-overlay");
    if (menuBtn && sidebar) {
      menuBtn.addEventListener("click", function () {
        sidebar.classList.toggle("is-open");
        if (overlay) overlay.classList.toggle("is-visible");
        menuBtn.setAttribute("aria-expanded", sidebar.classList.contains("is-open"));
      });
    }
    if (overlay) {
      overlay.addEventListener("click", function () {
        if (sidebar) sidebar.classList.remove("is-open");
        overlay.classList.remove("is-visible");
        if (menuBtn) menuBtn.setAttribute("aria-expanded", "false");
      });
    }

    var userTrigger = document.getElementById("user-trigger");
    var userDropdown = document.getElementById("user-dropdown");
    if (userTrigger && userDropdown) {
      userTrigger.addEventListener("click", function (e) {
        e.stopPropagation();
        userDropdown.classList.toggle("is-open");
        userTrigger.setAttribute("aria-expanded", userDropdown.classList.contains("is-open"));
      });
    }
    document.addEventListener("click", function (e) {
      if (!e.target.closest(".navbar__user")) {
        if (userDropdown) userDropdown.classList.remove("is-open");
        if (userTrigger) userTrigger.setAttribute("aria-expanded", "false");
      }
    });

    var collapseBtn = document.getElementById("sidebar-collapse-btn");
    var appBody = document.getElementById("app-body");
    if (collapseBtn && sidebar && appBody) {
      collapseBtn.addEventListener("click", function () {
        var isCollapsed = sidebar.classList.toggle("is-collapsed");
        appBody.classList.toggle("sidebar-expanded", !isCollapsed);
        appBody.classList.toggle("sidebar-collapsed", isCollapsed);
        collapseBtn.setAttribute("aria-expanded", !isCollapsed);
        collapseBtn.setAttribute("aria-label", isCollapsed ? "Expand sidebar" : "Collapse sidebar");
        collapseBtn.textContent = isCollapsed ? "›" : "‹";
      });
    }

    document.getElementById("th-select-all") && document.getElementById("th-select-all").addEventListener("change", function () {
      var checked = this.checked;
      document.querySelectorAll(".row-select").forEach(function (cb) {
        cb.checked = checked;
        if (checked) state.selectedIds.add(cb.dataset.id);
        else state.selectedIds.delete(cb.dataset.id);
      });
      var bulkAll = document.getElementById("bulk-select-all");
      if (bulkAll) bulkAll.checked = checked;
      updateBulkUI();
    });

    document.getElementById("bulk-select-all") && document.getElementById("bulk-select-all").addEventListener("change", function () {
      var checked = this.checked;
      document.querySelectorAll(".row-select").forEach(function (cb) {
        cb.checked = checked;
        if (checked) state.selectedIds.add(cb.dataset.id);
        else state.selectedIds.delete(cb.dataset.id);
      });
      document.getElementById("th-select-all") && (document.getElementById("th-select-all").checked = checked);
      updateBulkUI();
    });

    document.getElementById("bulk-move") && document.getElementById("bulk-move").addEventListener("click", function () { /* no-op */ });
    document.getElementById("bulk-reject") && document.getElementById("bulk-reject").addEventListener("click", function () {
      state.selectedIds.forEach(function (id) {
        var app = APPLICATIONS.find(function (a) { return String(a.id) === id; });
        if (app) app.finalStatus = "Rejected";
      });
      state.selectedIds.clear();
      render();
    });
    document.getElementById("bulk-assign") && document.getElementById("bulk-assign").addEventListener("click", function () { /* no-op */ });

    var colTrigger = document.getElementById("column-visibility-trigger");
    var colPanel = document.getElementById("column-visibility-panel");
    if (colTrigger && colPanel) {
      colTrigger.addEventListener("click", function (e) {
        e.stopPropagation();
        colPanel.classList.toggle("is-open");
        colTrigger.setAttribute("aria-expanded", colPanel.classList.contains("is-open"));
      });
      colPanel.querySelectorAll(".dropdown__item").forEach(function (item) {
        item.addEventListener("click", function () {
          var col = item.getAttribute("data-col");
          state.columnVisibility[col] = !state.columnVisibility[col];
          item.classList.toggle("is-selected", state.columnVisibility[col]);
          applyColumnVisibility();
        });
      });
      document.addEventListener("click", function (e) {
        if (!e.target.closest("#column-visibility-dropdown")) {
          colPanel.classList.remove("is-open");
          colTrigger.setAttribute("aria-expanded", "false");
        }
      });
    }

    var densityTrigger = document.getElementById("density-trigger");
    var densityPanel = document.getElementById("density-panel");
    if (densityTrigger && densityPanel) {
      densityTrigger.addEventListener("click", function (e) {
        e.stopPropagation();
        densityPanel.classList.toggle("is-open");
        densityTrigger.setAttribute("aria-expanded", densityPanel.classList.contains("is-open"));
      });
      densityPanel.querySelectorAll(".dropdown__item").forEach(function (item) {
        item.addEventListener("click", function () {
          state.density = item.getAttribute("data-density");
          densityPanel.querySelectorAll(".dropdown__item").forEach(function (i) { i.classList.remove("is-selected"); });
          item.classList.add("is-selected");
          applyDensity();
        });
      });
      document.addEventListener("click", function (e) {
        if (!e.target.closest("#density-dropdown")) {
          densityPanel.classList.remove("is-open");
          densityTrigger.setAttribute("aria-expanded", "false");
        }
      });
    }

    document.getElementById("page-size-select") && document.getElementById("page-size-select").addEventListener("change", function () {
      state.pageSize = parseInt(this.value, 10);
      state.page = 1;
      updatePagination();
    });

    document.getElementById("pagination-prev") && document.getElementById("pagination-prev").addEventListener("click", function () {
      if (state.page > 1) { state.page--; render(); }
    });
    document.getElementById("pagination-next") && document.getElementById("pagination-next").addEventListener("click", function () {
      var totalPages = Math.ceil(APPLICATIONS.length / state.pageSize);
      if (state.page < totalPages) { state.page++; render(); }
    });

    document.getElementById("save-filter-view") && document.getElementById("save-filter-view").addEventListener("click", function () { /* no-op */ });
    document.getElementById("export-csv") && document.getElementById("export-csv").addEventListener("click", function () { /* no-op */ });
    document.getElementById("add-application") && document.getElementById("add-application").addEventListener("click", function () { /* no-op */ });
    document.getElementById("filter-clear-all") && document.getElementById("filter-clear-all").addEventListener("click", function () { /* no-op */ });
    document.getElementById("empty-state-clear-filters") && document.getElementById("empty-state-clear-filters").addEventListener("click", function () { /* no-op */ });
  }

  function syncColumnVisibilityDropdown() {
    var colPanel = document.getElementById("column-visibility-panel");
    if (!colPanel) return;
    colPanel.querySelectorAll(".dropdown__item").forEach(function (item) {
      var col = item.getAttribute("data-col");
      item.classList.toggle("is-selected", state.columnVisibility[col]);
    });
  }

  function syncDensityDropdown() {
    var densityPanel = document.getElementById("density-panel");
    if (!densityPanel) return;
    densityPanel.querySelectorAll(".dropdown__item").forEach(function (item) {
      item.classList.toggle("is-selected", item.getAttribute("data-density") === state.density);
    });
  }

  function init() {
    syncColumnVisibilityDropdown();
    syncDensityDropdown();
    render();
    bindGlobalEvents();
    window.addEventListener("resize", function () { render(); });
  }

  init();
})();
