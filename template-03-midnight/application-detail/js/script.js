/**
 * Application Detail — Theme 03 Midnight
 * Fetch applications.json by ?id=, normalize single record, render. Vanilla JS.
 */
(function () {
  "use strict";

  var STATUS_OPTIONS = ["Applied", "New", "Screening", "Interview", "Offer", "Selected", "Rejected"];
  var STATUS_NEXT = {
    Applied: "Screening",
    New: "Screening",
    Screening: "Interview",
    Interview: "Offer",
    Offer: "Selected",
    Selected: "Selected",
    Rejected: "Rejected"
  };

  var applications = [];
  var state = {
    app: null,
    loading: true,
    error: null,
    isLocked: false
  };

  function getAppId() {
    var params = new URLSearchParams(window.location.search);
    return params.get("id") || "";
  }

  function getBasePath() {
    var script = document.querySelector("script[src$='script.js']");
    if (script && script.src) {
      var path = script.src.replace(/\/js\/script\.js.*$/, "");
      if (path && path !== script.src) return path;
    }
    return "";
  }

  function escapeHtml(str) {
    if (str == null) return "";
    var s = String(str);
    return s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function statusClass(s) {
    if (!s) return "status-badge--new";
    var lower = String(s).toLowerCase();
    if (lower === "applied") return "status-badge--applied";
    if (lower === "new") return "status-badge--new";
    if (lower === "screening") return "status-badge--screening";
    if (lower === "interview") return "status-badge--interview";
    if (lower === "offer") return "status-badge--offer";
    if (lower === "selected") return "status-badge--selected";
    if (lower === "rejected") return "status-badge--rejected";
    return "status-badge--new";
  }

  function aiScoreClass(score) {
    if (score == null) return "ai-score-badge--mid";
    var n = Number(score);
    if (n === 0) return "ai-score-badge--zero";
    if (n >= 80) return "ai-score-badge--high";
    if (n >= 50) return "ai-score-badge--mid";
    return "ai-score-badge--low";
  }

  function formatDateYear(dateStr) {
    if (!dateStr) return "—";
    var d = new Date(dateStr);
    return isNaN(d.getTime()) ? dateStr : d.getFullYear();
  }

  function formatDateRange(startStr, endStr) {
    if (!startStr) return "—";
    var start = new Date(startStr);
    var startYear = isNaN(start.getTime()) ? startStr : start.getFullYear();
    if (!endStr) return startYear + " – Present";
    var end = new Date(endStr);
    var endYear = isNaN(end.getTime()) ? endStr : end.getFullYear();
    return startYear + " – " + endYear;
  }

  function normalize(raw) {
    var id = raw.id;
    var appliedAt = raw.appliedAt || "";
    var ext = raw.aiExtraction || {};
    var resume = ext.resume || {};
    var we = (resume.workExperience || []).map(function (w) {
      return {
        company: w.company,
        role: w.jobTitle,
        start: formatDateRange(w.startDate, w.endDate).split(" – ")[0],
        end: w.endDate ? formatDateRange(w.startDate, w.endDate).split(" – ")[1] : "Present",
        summary: w.description
      };
    });
    var edu = (resume.education || []).map(function (e) {
      var year = e.endDate ? formatDateYear(e.endDate) : (e.startDate ? formatDateYear(e.startDate) + " – " + formatDateYear(e.endDate) : "—");
      return { institution: e.institution, degree: e.degree, year: year };
    });
    var proj = (resume.projects || []).map(function (p) {
      return { name: p.title, description: p.description, technologies: [] };
    });
    var notes = (raw.interviewNotes || []).map(function (n) {
      return {
        id: n.id || "n-" + (n.createdAt || "").replace(/\D/g, ""),
        author: n.round || "—",
        content: n.notes || "",
        createdAt: n.createdAt
      };
    });
    var cloudPlatforms = [];
    (resume.workExperience || []).forEach(function (w) {
      (w.cloudPlatforms || []).forEach(function (c) {
        if (cloudPlatforms.indexOf(c) === -1) cloudPlatforms.push(c);
      });
    });
    var cloudExperience = cloudPlatforms.length ? cloudPlatforms.join(", ") : "—";
    var statusHistory = notes.length
      ? notes.map(function (n) { return { stage: n.author, label: n.author, timestamp: n.createdAt }; })
      : [{ stage: raw.status || "Applied", label: raw.status || "Applied", timestamp: appliedAt }];

    return {
      id: id,
      candidateName: raw.fullName,
      email: raw.email,
      phone: raw.mobile,
      noticePeriod: raw.noticePeriod,
      currentCTC: raw.currentCTC != null ? String(raw.currentCTC) : "—",
      graduationYear: raw.graduationYear,
      totalExperience: raw.experience,
      aiRelevancyScore: raw.aiRelevancyScore,
      cloudExperience: cloudExperience,
      skills: [],
      assignee: raw.assignee,
      finalStatus: raw.status || "Applied",
      isStarred: !!raw.starred,
      createdAt: appliedAt,
      updatedAt: raw.updatedAt || appliedAt,
      jobTitle: raw.job,
      resumeUrl: raw.resumeUrl,
      resumeContent: "",
      statusHistory: statusHistory,
      interviewNotes: notes,
      workExperience: we,
      education: edu,
      projects: proj,
      aiInsights: {
        pros: ext.pros || [],
        cons: ext.cons || [],
        structuredResume: { summary: resume.summary, keySkills: [] }
      },
      isInvalid: false,
      rejectedAt: null,
      rejectionReason: null,
      isReopened: false
    };
  }

  function otherApplicationsForCandidate() {
    if (!state.app) return [];
    var email = state.app.email;
    return applications.filter(function (a) {
      var normId = a.id === state.app.id || String(a.id) === String(state.app.id);
      return a.email === email && !normId;
    });
  }

  function setLocked(locked) {
    state.isLocked = locked;
    var banner = document.getElementById("detail-banner-locked");
    if (banner) banner.hidden = !locked;
    var moveBtn = document.getElementById("action-move-next");
    var rejectBtn = document.getElementById("action-reject");
    if (moveBtn) moveBtn.disabled = locked;
    if (rejectBtn) rejectBtn.disabled = locked;
  }

  function renderHeader() {
    var app = state.app;
    if (!app) return;
    var nameEl = document.getElementById("detail-header-name");
    var jobEl = document.getElementById("detail-header-job");
    var aiEl = document.getElementById("detail-header-ai");
    var statusSelect = document.getElementById("detail-status");
    var assigneeSelect = document.getElementById("detail-assignee");
    var starBtn = document.getElementById("action-star");
    if (nameEl) nameEl.textContent = app.candidateName || "—";
    if (jobEl) jobEl.textContent = app.jobTitle ? "Job: " + app.jobTitle : "—";
    var score = app.aiRelevancyScore != null ? app.aiRelevancyScore : 0;
    if (aiEl) {
      aiEl.textContent = score + "%";
      aiEl.className = "ai-score-badge detail-header__ai " + aiScoreClass(score);
    }
    var assigneeOpts = ["Unassigned", "illias@kubenine.com", "Rahul Mehta", "Sneha Reddy"];
    if (app.assignee && assigneeOpts.indexOf(app.assignee) === -1) assigneeOpts.push(app.assignee);
    if (statusSelect) {
      statusSelect.innerHTML = STATUS_OPTIONS.map(function (s) {
        return "<option value=\"" + escapeHtml(s) + "\"" + (s === app.finalStatus ? " selected" : "") + ">" + escapeHtml(s) + "</option>";
      }).join("");
    }
    if (assigneeSelect) {
      assigneeSelect.innerHTML = assigneeOpts.map(function (a) {
        return "<option value=\"" + escapeHtml(a) + "\"" + (a === (app.assignee || "Unassigned") ? " selected" : "") + ">" + escapeHtml(a) + "</option>";
      }).join("");
    }
    if (starBtn) {
      starBtn.textContent = app.isStarred ? "★" : "☆";
      starBtn.classList.toggle("is-starred", app.isStarred);
      starBtn.setAttribute("aria-label", app.isStarred ? "Unstar" : "Star");
    }
    setLocked(app.finalStatus === "Rejected" && !app.isReopened);
  }

  function renderOverview() {
    var app = state.app;
    var el = document.getElementById("card-overview-body");
    if (!el || !app) return;
    var rows = [
      ["Email", app.email],
      ["Phone", app.phone],
      ["Notice Period", app.noticePeriod],
      ["Current CTC", app.currentCTC],
      ["Total Experience", app.totalExperience != null ? app.totalExperience + " yr" : "—"],
      ["Graduation Year", app.graduationYear != null ? String(app.graduationYear) : "—"],
      ["Cloud", app.cloudExperience]
    ];
    var skillsHtml = Array.isArray(app.skills) && app.skills.length
      ? app.skills.map(function (s) { return "<span class=\"skill-tag\">" + escapeHtml(s) + "</span>"; }).join("")
      : "—";
    el.innerHTML =
      "<div class=\"data-list\">" +
      rows.map(function (r) {
        return "<div class=\"data-list__row\"><span class=\"data-list__label\">" + escapeHtml(r[0]) + "</span><span class=\"data-list__value\">" + escapeHtml(r[1]) + "</span></div>";
      }).join("") +
      "<div class=\"data-list__row\"><span class=\"data-list__label\">Skills</span><span class=\"data-list__value\">" + skillsHtml + "</span></div>" +
      "</div>";
  }

  function renderAiInsights() {
    var app = state.app;
    var el = document.getElementById("card-ai-body");
    if (!el || !app) return;
    var ai = app.aiInsights || {};
    var pros = ai.pros || [];
    var cons = ai.cons || [];
    var sr = ai.structuredResume || {};
    var html = "";
    if (pros.length) {
      html += "<h3 class=\"card__subtitle\">Pros</h3><ul class=\"pros-cons-list\">" + pros.map(function (p) { return "<li>" + escapeHtml(p) + "</li>"; }).join("") + "</ul>";
    }
    if (cons.length) {
      html += "<h3 class=\"card__subtitle\">Cons</h3><ul class=\"pros-cons-list\">" + cons.map(function (c) { return "<li>" + escapeHtml(c) + "</li>"; }).join("") + "</ul>";
    }
    if (sr && sr.summary) {
      html += "<h3 class=\"card__subtitle\">Structured Resume</h3><div class=\"structured-resume\"><p><strong>Summary:</strong> " + escapeHtml(sr.summary) + "</p></div>";
    }
    if (!html) html = "<p class=\"color-text-muted\">No AI insights yet.</p>";
    el.innerHTML = html;
  }

  function renderWorkExperience() {
    var app = state.app;
    var el = document.getElementById("card-work-body");
    if (!el || !app) return;
    var list = app.workExperience || [];
    if (!list.length) {
      el.innerHTML = "<p class=\"color-text-muted\">No work experience listed.</p>";
      return;
    }
    el.innerHTML = "<div class=\"timeline\">" + list.map(function (w) {
      return "<div class=\"timeline__item\">" +
        "<p class=\"timeline__role\">" + escapeHtml(w.role) + "</p>" +
        "<p class=\"timeline__company\">" + escapeHtml(w.company) + "</p>" +
        "<p class=\"timeline__dates\">" + escapeHtml(w.start) + " – " + escapeHtml(w.end) + "</p>" +
        (w.summary ? "<p class=\"timeline__summary\">" + escapeHtml(w.summary) + "</p>" : "") +
        "</div>";
    }).join("") + "</div>";
  }

  function renderProjects() {
    var app = state.app;
    var el = document.getElementById("card-projects-body");
    if (!el || !app) return;
    var list = app.projects || [];
    if (!list.length) {
      el.innerHTML = "<p class=\"color-text-muted\">No projects listed.</p>";
      return;
    }
    el.innerHTML = "<ul class=\"data-list\">" + list.map(function (p) {
      return "<li><strong>" + escapeHtml(p.name) + "</strong>" +
        (p.description ? "<p class=\"font-size-sm color-text-secondary\">" + escapeHtml(p.description) + "</p>" : "") +
        (p.technologies && p.technologies.length ? "<p class=\"font-size-xs\">" + escapeHtml(p.technologies.join(", ")) + "</p>" : "") +
        "</li>";
    }).join("") + "</ul>";
  }

  function renderEducation() {
    var app = state.app;
    var el = document.getElementById("card-education-body");
    if (!el || !app) return;
    var list = app.education || [];
    if (!list.length) {
      el.innerHTML = "<p class=\"color-text-muted\">No education listed.</p>";
      return;
    }
    el.innerHTML = "<div class=\"data-list\">" + list.map(function (e) {
      return "<div class=\"data-list__row\">" +
        "<span class=\"data-list__label\">" + escapeHtml(e.institution) + "</span>" +
        "<span class=\"data-list__value\">" + escapeHtml(e.degree) + " (" + escapeHtml(e.year) + ")</span>" +
        "</div>";
    }).join("") + "</div>";
  }

  function renderNotesTable() {
    var app = state.app;
    var tbody = document.getElementById("notes-tbody");
    if (!tbody || !app) return;
    var notes = app.interviewNotes || [];
    if (!notes.length) {
      tbody.innerHTML = "<tr><td colspan=\"3\">No notes yet.</td></tr>";
      return;
    }
    tbody.innerHTML = notes.map(function (n) {
      var d = n.createdAt ? new Date(n.createdAt).toLocaleDateString() : "—";
      var author = n.author != null ? n.author : "—";
      var content = n.content != null ? n.content : "";
      return "<tr><td>" + escapeHtml(d) + "</td><td>" + escapeHtml(author) + "</td><td>" + escapeHtml(content) + "</td></tr>";
    }).join("");
  }

  function renderMetadata() {
    var app = state.app;
    var el = document.getElementById("card-meta-body");
    if (!el || !app) return;
    var rows = [
      ["Application ID", app.id],
      ["Created", app.createdAt ? new Date(app.createdAt).toLocaleString() : "—"],
      ["Updated", app.updatedAt ? new Date(app.updatedAt).toLocaleString() : "—"],
      ["Source", "Career Page"]
    ];
    el.innerHTML = "<div class=\"data-list\">" + rows.map(function (r) {
      return "<div class=\"data-list__row\"><span class=\"data-list__label\">" + escapeHtml(r[0]) + "</span><span class=\"data-list__value\">" + escapeHtml(r[1]) + "</span></div>";
    }).join("") + "</div>";
  }

  function renderStepper() {
    var app = state.app;
    var el = document.getElementById("status-stepper");
    if (!el || !app) return;
    var history = app.statusHistory || [];
    var current = app.finalStatus || "Applied";
    if (!history.length) {
      history = [{ stage: current, label: current, timestamp: app.updatedAt || app.createdAt }];
    }
    var opts = STATUS_OPTIONS;
    el.innerHTML = history.map(function (step) {
      var isCompleted = opts.indexOf(step.stage) <= opts.indexOf(current) || step.stage === current;
      var isCurrent = step.stage === current;
      var dateStr = step.timestamp ? new Date(step.timestamp).toLocaleDateString() : "";
      return "<div class=\"stepper__step" + (isCompleted ? " is-completed" : "") + (isCurrent ? " is-current" : "") + "\">" +
        "<p class=\"stepper__label\">" + escapeHtml(step.label) + "</p>" +
        "<p class=\"stepper__date\">" + escapeHtml(dateStr) + "</p>" +
        "</div>";
    }).join("");
  }

  function detailUrl(id) {
    return "?id=" + encodeURIComponent(id);
  }

  function renderInterviewHistory() {
    var app = state.app;
    var el = document.getElementById("interview-history");
    if (!el || !app) return;
    var others = otherApplicationsForCandidate();
    if (!others.length) {
      el.innerHTML = "<p class=\"color-text-muted\">No other applications for this candidate.</p>";
      return;
    }
    var rehire = others.length > 0;
    el.innerHTML = others.map(function (a) {
      var jobTitle = a.job || a.id;
      var score = a.aiRelevancyScore != null ? a.aiRelevancyScore : "—";
      var rehireClass = rehire ? " interview-history__item is-rehire" : " interview-history__item";
      return "<a href=\"" + detailUrl(a.id) + "\" class=\"" + rehireClass + "\">" +
        "<div class=\"interview-history__row\">" +
        "<span class=\"interview-history__job\">" + escapeHtml(jobTitle) + "</span>" +
        (rehire ? "<span class=\"rehire-badge\">Rehire</span>" : "") +
        "</div>" +
        "<div class=\"interview-history__meta\">" +
        "<span class=\"status-badge " + statusClass(a.status || a.finalStatus) + "\">" + escapeHtml(a.status || a.finalStatus || "—") + "</span>" +
        "<span>AI: " + escapeHtml(score) + "%</span>" +
        "</div>" +
        "</a>";
    }).join("");
  }

  function showContent(show) {
    var loading = document.getElementById("detail-loading");
    var error = document.getElementById("detail-error");
    var header = document.getElementById("detail-header");
    var banner = document.getElementById("detail-banner-locked");
    var columns = document.querySelector(".detail-columns");
    if (loading) loading.classList.toggle("is-hidden", show);
    if (error) error.hidden = show;
    if (header) header.style.display = show ? "" : "none";
    if (banner) banner.style.display = show ? "" : "none";
    if (columns) columns.style.display = show ? "" : "none";
  }

  function render() {
    if (state.loading) {
      showContent(false);
      var loadEl = document.getElementById("detail-loading");
      if (loadEl) loadEl.classList.remove("is-hidden");
      var errEl = document.getElementById("detail-error");
      if (errEl) errEl.hidden = true;
      return;
    }
    if (state.error) {
      showContent(false);
      var loadEl2 = document.getElementById("detail-loading");
      if (loadEl2) loadEl2.classList.add("is-hidden");
      var errEl2 = document.getElementById("detail-error");
      var msgEl = document.getElementById("detail-error-message");
      if (msgEl) msgEl.textContent = state.error;
      if (errEl2) errEl2.hidden = false;
      return;
    }
    showContent(true);
    renderHeader();
    renderOverview();
    renderAiInsights();
    renderWorkExperience();
    renderProjects();
    renderEducation();
    renderNotesTable();
    renderMetadata();
    renderStepper();
    renderInterviewHistory();
  }

  function openModal(title, bodyHtml, footerHtml) {
    var overlay = document.getElementById("modal-overlay");
    var titleEl = document.getElementById("modal-title");
    var bodyEl = document.getElementById("modal-body");
    var footerEl = document.getElementById("modal-footer");
    if (titleEl) titleEl.textContent = title;
    if (bodyEl) bodyEl.innerHTML = bodyHtml || "";
    if (footerEl) footerEl.innerHTML = footerHtml || "";
    if (overlay) {
      overlay.classList.add("is-open");
      overlay.setAttribute("aria-hidden", "false");
      var firstFocus = overlay.querySelector("button, [href], input, select, textarea");
      if (firstFocus) firstFocus.focus();
    }
  }

  function closeModal() {
    var overlay = document.getElementById("modal-overlay");
    if (overlay) {
      overlay.classList.remove("is-open");
      overlay.setAttribute("aria-hidden", "true");
    }
  }

  function openDrawer() {
    var overlay = document.getElementById("drawer-overlay");
    var authorEl = document.getElementById("drawer-note-author");
    var contentEl = document.getElementById("drawer-note-content");
    if (authorEl) authorEl.value = "";
    if (contentEl) contentEl.value = "";
    if (overlay) {
      overlay.classList.add("is-open");
      overlay.setAttribute("aria-hidden", "false");
      if (authorEl) authorEl.focus();
    }
  }

  function closeDrawer() {
    var overlay = document.getElementById("drawer-overlay");
    if (overlay) {
      overlay.classList.remove("is-open");
      overlay.setAttribute("aria-hidden", "true");
    }
  }

  function bindModal() {
    var overlay = document.getElementById("modal-overlay");
    var closeBtn = document.getElementById("modal-close");
    if (overlay) {
      overlay.addEventListener("click", function (e) {
        if (e.target === overlay) closeModal();
      });
    }
    if (closeBtn) closeBtn.addEventListener("click", closeModal);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && overlay && overlay.classList.contains("is-open")) closeModal();
    });
  }

  function bindDrawer() {
    var overlay = document.getElementById("drawer-overlay");
    var closeBtn = document.getElementById("drawer-close");
    var cancelBtn = document.getElementById("drawer-cancel");
    var submitBtn = document.getElementById("drawer-submit");
    if (closeBtn) closeBtn.addEventListener("click", closeDrawer);
    if (cancelBtn) cancelBtn.addEventListener("click", closeDrawer);
    if (overlay) {
      overlay.addEventListener("click", function (e) {
        if (e.target === overlay) closeDrawer();
      });
    }
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && overlay && overlay.classList.contains("is-open")) closeDrawer();
    });
    if (submitBtn) {
      submitBtn.addEventListener("click", function () {
        var authorEl = document.getElementById("drawer-note-author");
        var contentEl = document.getElementById("drawer-note-content");
        var author = authorEl ? authorEl.value.trim() : "";
        var content = contentEl ? contentEl.value.trim() : "";
        if (!author || !content) return;
        if (!state.app) return;
        if (!state.app.interviewNotes) state.app.interviewNotes = [];
        state.app.interviewNotes.push({
          id: "n-" + Date.now(),
          author: author,
          content: content,
          createdAt: new Date().toISOString()
        });
        renderNotesTable();
        closeDrawer();
      });
    }
  }

  function bindActions() {
    var viewResume = document.getElementById("action-view-resume");
    var starBtn = document.getElementById("action-star");
    var markInvalid = document.getElementById("action-mark-invalid");
    var moveNext = document.getElementById("action-move-next");
    var rejectBtn = document.getElementById("action-reject");
    var addNote = document.getElementById("action-add-note");

    if (viewResume) {
      viewResume.addEventListener("click", function () {
        if (!state.app) return;
        var url = state.app.resumeUrl;
        if (url) {
          var base = getBasePath();
          var fullUrl = base ? base + "/" + url.replace(/^\//, "") : url;
          openModal(
            "Resume",
            "<iframe src=\"" + escapeHtml(fullUrl) + "\" class=\"modal-resume-iframe\" title=\"Resume PDF\"></iframe>",
            "<button type=\"button\" class=\"btn btn--primary\" id=\"modal-close-btn\">Close</button>"
          );
          var closeBtn = document.getElementById("modal-close-btn");
          if (closeBtn) closeBtn.addEventListener("click", closeModal);
        } else {
          openModal("Resume", "<p class=\"color-text-muted\">No resume available.</p>", "<button type=\"button\" class=\"btn btn--primary\" id=\"modal-close-btn\">Close</button>");
          var closeBtn2 = document.getElementById("modal-close-btn");
          if (closeBtn2) closeBtn2.addEventListener("click", closeModal);
        }
      });
    }

    if (starBtn) {
      starBtn.addEventListener("click", function () {
        if (!state.app) return;
        state.app.isStarred = !state.app.isStarred;
        renderHeader();
      });
    }

    if (markInvalid) {
      markInvalid.addEventListener("click", function () {
        openModal(
          "Mark Invalid",
          "<p>Mark this application as invalid? This will flag the application.</p>",
          "<button type=\"button\" class=\"btn btn--ghost\" id=\"modal-cancel-invalid\">Cancel</button><button type=\"button\" class=\"btn btn--primary\" id=\"modal-confirm-invalid\">Mark Invalid</button>"
        );
        var cancelBtn = document.getElementById("modal-cancel-invalid");
        var confirmBtn = document.getElementById("modal-confirm-invalid");
        if (cancelBtn) cancelBtn.addEventListener("click", closeModal);
        if (confirmBtn) {
          confirmBtn.addEventListener("click", function () {
            if (state.app) state.app.isInvalid = true;
            closeModal();
            render();
          });
        }
      });
    }

    if (moveNext) {
      moveNext.addEventListener("click", function () {
        if (!state.app || state.isLocked) return;
        var next = STATUS_NEXT[state.app.finalStatus] || state.app.finalStatus;
        if (next === state.app.finalStatus) return;
        openModal(
          "Move to Next Round",
          "<p>Move this application to <strong>" + escapeHtml(next) + "</strong>?</p>",
          "<button type=\"button\" class=\"btn btn--ghost\" id=\"modal-cancel-move\">Cancel</button><button type=\"button\" class=\"btn btn--primary\" id=\"modal-confirm-move\">Move</button>"
        );
        var cancelBtn = document.getElementById("modal-cancel-move");
        var confirmBtn = document.getElementById("modal-confirm-move");
        if (cancelBtn) cancelBtn.addEventListener("click", closeModal);
        if (confirmBtn) {
          confirmBtn.addEventListener("click", function () {
            if (state.app) {
              state.app.finalStatus = next;
              state.app.statusHistory = state.app.statusHistory || [];
              state.app.statusHistory.push({ stage: next, label: next, timestamp: new Date().toISOString() });
            }
            closeModal();
            render();
          });
        }
      });
    }

    if (rejectBtn) {
      rejectBtn.addEventListener("click", function () {
        if (!state.app || state.isLocked) return;
        openModal(
          "Reject Application",
          "<p>Please provide a reason for rejection (required).</p><textarea id=\"modal-reject-reason\" class=\"drawer__textarea\" rows=\"3\" required placeholder=\"Reason...\"></textarea>",
          "<button type=\"button\" class=\"btn btn--ghost\" id=\"modal-cancel-reject\">Cancel</button><button type=\"button\" class=\"btn btn--danger\" id=\"modal-confirm-reject\">Reject</button>"
        );
        var cancelBtn = document.getElementById("modal-cancel-reject");
        var confirmBtn = document.getElementById("modal-confirm-reject");
        if (cancelBtn) cancelBtn.addEventListener("click", closeModal);
        if (confirmBtn) {
          confirmBtn.addEventListener("click", function () {
            var reasonEl = document.getElementById("modal-reject-reason");
            var reason = reasonEl && reasonEl.value.trim();
            if (!reason) return;
            if (state.app) {
              state.app.finalStatus = "Rejected";
              state.app.rejectionReason = reason;
              state.app.rejectedAt = new Date().toISOString();
              state.app.statusHistory = state.app.statusHistory || [];
              state.app.statusHistory.push({ stage: "Rejected", label: "Rejected", timestamp: state.app.rejectedAt });
            }
            closeModal();
            setLocked(true);
            render();
          });
        }
      });
    }

    if (addNote) addNote.addEventListener("click", openDrawer);

    var statusSelect = document.getElementById("detail-status");
    var assigneeSelect = document.getElementById("detail-assignee");
    if (statusSelect) {
      statusSelect.addEventListener("change", function () {
        if (!state.app) return;
        var val = statusSelect.value;
        if (val === "Rejected") {
          var prev = state.app.finalStatus;
          openModal(
            "Reject Application",
            "<p>Please provide a reason for rejection (required).</p><textarea id=\"modal-reject-reason\" class=\"drawer__textarea\" rows=\"3\" required placeholder=\"Reason...\"></textarea>",
            "<button type=\"button\" class=\"btn btn--ghost\" id=\"modal-cancel-reject\">Cancel</button><button type=\"button\" class=\"btn btn--danger\" id=\"modal-confirm-reject\">Reject</button>"
          );
          var cancelBtn = document.getElementById("modal-cancel-reject");
          var confirmBtn = document.getElementById("modal-confirm-reject");
          if (cancelBtn) cancelBtn.addEventListener("click", function () { closeModal(); statusSelect.value = prev; });
          if (confirmBtn) {
            confirmBtn.addEventListener("click", function () {
              var reasonEl = document.getElementById("modal-reject-reason");
              var reason = reasonEl && reasonEl.value.trim();
              if (!reason) return;
              if (state.app) {
                state.app.finalStatus = "Rejected";
                state.app.rejectionReason = reason;
                state.app.rejectedAt = new Date().toISOString();
                state.app.statusHistory = state.app.statusHistory || [];
                state.app.statusHistory.push({ stage: "Rejected", label: "Rejected", timestamp: state.app.rejectedAt });
              }
              closeModal();
              setLocked(true);
              render();
            });
          }
          return;
        }
        state.app.finalStatus = val;
        renderHeader();
        renderStepper();
      });
    }
    if (assigneeSelect) {
      assigneeSelect.addEventListener("change", function () {
        if (state.app) state.app.assignee = assigneeSelect.value;
      });
    }
  }

  function bindShell() {
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
  }

  function init() {
    var id = getAppId();
    if (!id) {
      state.loading = false;
      state.error = "No application ID provided. Use the Applications list and click View to open an application.";
      render();
      bindShell();
      bindModal();
      bindDrawer();
      bindActions();
      return;
    }
    var base = getBasePath();
    var appsUrl = (base ? base + "/" : "") + "data/applications.json";

    fetch(appsUrl)
      .then(function (r) {
        if (!r.ok) throw new Error("Failed to load applications");
        return r.json();
      })
      .then(function (data) {
        applications = Array.isArray(data) ? data : [];
        var raw = applications.find(function (a) {
          return String(a.id) === String(id);
        });
        if (!raw) {
          state.app = null;
          state.error = "Application not found.";
        } else {
          state.app = normalize(raw);
        }
        state.loading = false;
        render();
      })
      .catch(function (err) {
        state.loading = false;
        state.error = (err && err.message) || "Failed to load application.";
        render();
      });

    bindShell();
    bindModal();
    bindDrawer();
    bindActions();
  }

  init();
})();
