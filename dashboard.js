(function () {
  "use strict";

  // ══════════════════════════════════════════════════════════════════════
  // CONFIG — Replace these webhook URLs with your actual n8n webhook URLs
  // ══════════════════════════════════════════════════════════════════════
  var CONFIG = {
    // Webhook that returns all conversations from all platforms
    // Should return: { conversations: [ { id, platform, name, messages: [...], status, assignedTo, lastMessageTime } ] }
    FETCH_MESSAGES_WEBHOOK: "https://n8n-n8n.7toway.easypanel.host/webhook/REPLACE-FETCH-MESSAGES",

    // Webhook to send a reply to a conversation
    // Receives: { conversationId, platform, recipientId, message, agentName }
    SEND_REPLY_WEBHOOK: "https://n8n-n8n.7toway.easypanel.host/webhook/REPLACE-SEND-REPLY",

    // Webhook that returns Facebook page comments
    // Should return: { comments: [ { id, postId, postTitle, userName, userAvatar, message, time, pageId, pageName } ] }
    FETCH_COMMENTS_WEBHOOK: "https://n8n-n8n.7toway.easypanel.host/webhook/REPLACE-FETCH-COMMENTS",

    // Webhook to reply to a Facebook comment
    // Receives: { commentId, postId, message, pageId }
    REPLY_COMMENT_WEBHOOK: "https://n8n-n8n.7toway.easypanel.host/webhook/REPLACE-REPLY-COMMENT",

    // Webhook to update conversation status
    // Receives: { conversationId, status, assignedTo }
    UPDATE_STATUS_WEBHOOK: "https://n8n-n8n.7toway.easypanel.host/webhook/REPLACE-UPDATE-STATUS",
  };

  // Staff accounts (simple — replace with your own)
  var STAFF = [
    { email: "admin@livityprojects.com", password: "Livity2026!", name: "Admin", role: "Manager" },
    { email: "staff@livityprojects.com", password: "Staff2026!", name: "Staff", role: "Customer Service" },
  ];

  // ══════════ STATE ══════════
  var currentUser = null;
  var conversations = [];
  var allComments = [];
  var activeConvoId = null;
  var currentPlatformFilter = "all";
  var currentStatusFilter = "all";
  var searchQuery = "";
  var activityLog = [];

  // ══════════ UTILITIES ══════════
  function $(id) { return document.getElementById(id); }
  function now() { return new Date(); }
  function timeStr(d) {
    if (!d) return "—";
    var dt = new Date(d);
    return dt.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
  }
  function dateStr(d) {
    return new Date(d).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  }
  function initials(name) {
    if (!name) return "?";
    var parts = name.trim().split(/\s+/);
    return parts.length > 1 ? (parts[0][0] + parts[1][0]).toUpperCase() : name.substring(0, 2).toUpperCase();
  }
  function escHtml(s) {
    var d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }
  function platformIcon(p) {
    var icons = { whatsapp: "fab fa-whatsapp", messenger: "fab fa-facebook-messenger", instagram: "fab fa-instagram", tiktok: "fab fa-tiktok" };
    return icons[p] || "fas fa-comment";
  }
  function platformLabel(p) {
    var labels = { whatsapp: "WhatsApp", messenger: "Messenger", instagram: "Instagram", tiktok: "TikTok" };
    return labels[p] || p;
  }

  // ══════════ CLOCK ══════════
  function updateClock() {
    var n = now();
    $("liveTime").textContent = n.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true });
    $("liveDate").textContent = n.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  }

  // ══════════ ACTIVITY LOG ══════════
  function addLog(icon, text) {
    activityLog.unshift({ icon: icon, text: text, time: now().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) });
    renderLog();
  }
  function renderLog() {
    var el = $("logList");
    if (!activityLog.length) { el.innerHTML = '<div class="log-empty">No activity recorded yet</div>'; return; }
    el.innerHTML = activityLog.slice(0, 30).map(function (l) {
      return '<div class="log-item"><span class="log-time">' + l.time + '</span><i class="log-icon ' + l.icon + '"></i><span>' + escHtml(l.text) + '</span></div>';
    }).join("");
  }

  // ══════════ LOGIN ══════════
  function doLogin() {
    var email = $("loginEmail").value.trim().toLowerCase();
    var pass = $("loginPassword").value;
    var err = $("loginError");

    var user = null;
    for (var i = 0; i < STAFF.length; i++) {
      if (STAFF[i].email.toLowerCase() === email && STAFF[i].password === pass) { user = STAFF[i]; break; }
    }

    if (!user) {
      err.textContent = "Invalid email or password.";
      err.classList.remove("hidden");
      return;
    }

    err.classList.add("hidden");
    currentUser = user;
    try { localStorage.setItem("livity_dash_user", JSON.stringify(user)); } catch (e) {}

    showDashboard();
  }

  function doLogout() {
    currentUser = null;
    try { localStorage.removeItem("livity_dash_user"); } catch (e) {}
    $("loginScreen").classList.remove("hidden");
    $("dashboard").classList.add("hidden");
    $("loginEmail").value = "";
    $("loginPassword").value = "";
  }

  function showDashboard() {
    $("loginScreen").classList.add("hidden");
    $("dashboard").classList.remove("hidden");
    $("dashName").textContent = currentUser.name;
    $("dashRole").textContent = currentUser.role;
    $("dashAvatar").textContent = initials(currentUser.name);
    addLog("fas fa-sign-in-alt", currentUser.name + " signed in");
  }

  // ══════════ TABS ══════════
  window.switchTab = function (tab) {
    document.querySelectorAll(".comms-tab").forEach(function (t) { t.classList.remove("active"); });
    document.querySelector('[data-tab="' + tab + '"]').classList.add("active");
    $("panelInbox").classList.toggle("hidden", tab !== "inbox");
    $("panelComments").classList.toggle("hidden", tab !== "comments");
  };

  // ══════════ FETCH MESSAGES ══════════
  window.fetchAllMessages = async function () {
    var btn = $("btnRefresh");
    btn.classList.add("loading");
    btn.disabled = true;

    try {
      var res = await fetch(CONFIG.FETCH_MESSAGES_WEBHOOK, { method: "GET" });
      if (!res.ok) throw new Error("HTTP " + res.status);
      var data = await res.json();

      // Normalize: expect { conversations: [...] } or just an array
      if (Array.isArray(data)) conversations = data;
      else if (data.conversations) conversations = data.conversations;
      else if (data.data) conversations = data.data;
      else conversations = [];

      updateStats();
      renderConversations();
      addLog("fas fa-download", "Loaded " + conversations.length + " conversations");
    } catch (err) {
      console.error("Fetch messages error:", err);
      addLog("fas fa-exclamation-triangle", "Failed to load messages: " + err.message);

      // Load demo data for testing
      conversations = getDemoConversations();
      updateStats();
      renderConversations();
      addLog("fas fa-info-circle", "Loaded demo data (webhook not connected)");
    } finally {
      btn.classList.remove("loading");
      btn.disabled = false;
    }
  };

  function updateStats() {
    var counts = { whatsapp: 0, messenger: 0, instagram: 0, tiktok: 0 };
    conversations.forEach(function (c) {
      var p = (c.platform || "").toLowerCase();
      if (counts[p] !== undefined) counts[p]++;
    });
    $("statWhatsapp").textContent = counts.whatsapp;
    $("statMessenger").textContent = counts.messenger;
    $("statInstagram").textContent = counts.instagram;
    $("statTiktok").textContent = counts.tiktok;
    $("statTotal").textContent = conversations.length;
  }

  // ══════════ RENDER CONVERSATIONS ══════════
  function renderConversations() {
    var list = $("inboxList");
    var filtered = conversations.filter(function (c) {
      var p = (c.platform || "").toLowerCase();
      if (currentPlatformFilter !== "all" && p !== currentPlatformFilter) return false;
      if (currentStatusFilter !== "all" && (c.status || "new") !== currentStatusFilter) return false;
      if (searchQuery) {
        var q = searchQuery.toLowerCase();
        return (c.name || "").toLowerCase().includes(q) || (c.lastMessage || "").toLowerCase().includes(q);
      }
      return true;
    });

    if (!filtered.length) {
      list.innerHTML = '<div class="inbox-empty"><i class="fas fa-search"></i><span>No conversations found</span></div>';
      return;
    }

    list.innerHTML = filtered.map(function (c) {
      var p = (c.platform || "whatsapp").toLowerCase();
      var statusClass = (c.status === "resolved") ? "resolved" : (c.status === "in_progress") ? "progress" : "new";
      var isActive = c.id === activeConvoId ? " active" : "";
      var isUnread = (c.status || "new") === "new" ? " unread" : "";
      var lastMsg = c.lastMessage || (c.messages && c.messages.length ? c.messages[c.messages.length - 1].text : "No messages");
      var lastTime = c.lastMessageTime || (c.messages && c.messages.length ? c.messages[c.messages.length - 1].time : "");

      return '<div class="convo-item' + isActive + isUnread + '" onclick="openConvo(\'' + c.id + '\')">'
        + '<div class="convo-avatar ' + p + '"><i class="' + platformIcon(p) + '"></i></div>'
        + '<div class="convo-info">'
        + '<div class="convo-name">' + escHtml(c.name || "Unknown") + '</div>'
        + '<div class="convo-preview">' + escHtml(lastMsg).substring(0, 50) + '</div>'
        + '</div>'
        + '<div class="convo-meta">'
        + '<div class="convo-time">' + timeStr(lastTime) + '</div>'
        + '<div class="convo-status-dot status-dot ' + statusClass + '"></div>'
        + '</div></div>';
    }).join("");
  }

  // ══════════ FILTERS ══════════
  window.filterInbox = function (platform, btn) {
    currentPlatformFilter = platform;
    document.querySelectorAll("#inboxFilters .filter-chip").forEach(function (b) { b.classList.remove("active"); });
    btn.classList.add("active");
    renderConversations();
  };

  window.filterStatus = function (status, btn) {
    currentStatusFilter = status;
    document.querySelectorAll(".status-chip").forEach(function (b) { b.classList.remove("active"); });
    btn.classList.add("active");
    renderConversations();
  };

  window.searchInbox = function (q) {
    searchQuery = q;
    renderConversations();
  };

  // ══════════ OPEN CONVERSATION ══════════
  window.openConvo = function (id) {
    activeConvoId = id;
    var convo = conversations.find(function (c) { return c.id === id; });
    if (!convo) return;

    var p = (convo.platform || "whatsapp").toLowerCase();

    // Update header
    $("chatHeader").classList.remove("hidden");
    $("chatReply").classList.remove("hidden");
    $("chatName").textContent = convo.name || "Unknown";
    $("chatPlatform").textContent = platformLabel(p);
    $("chatPlatform").className = "chat-contact-platform " + p;
    $("chatAvatar").innerHTML = '<i class="' + platformIcon(p) + '"></i>';
    $("chatAvatar").className = "chat-avatar";
    $("chatAvatar").style.background = "";
    $("chatStatusSelect").value = convo.status || "new";
    $("replyPlatform").textContent = platformLabel(p);

    // Render messages
    var msgs = convo.messages || [];
    var body = $("chatBody");
    if (!msgs.length) {
      body.innerHTML = '<div class="chat-empty"><i class="fas fa-comments"></i><span>No messages in this conversation</span></div>';
    } else {
      body.innerHTML = msgs.map(function (m) {
        var dir = m.direction === "outgoing" ? "outgoing" : "incoming";
        return '<div class="msg-bubble ' + dir + '">'
          + '<div>' + escHtml(m.text || "") + '</div>'
          + '<div class="msg-time">' + timeStr(m.time) + '</div>'
          + '</div>';
      }).join("");
      body.scrollTop = body.scrollHeight;
    }

    // Mobile: show chat panel
    $("inboxList").classList.add("chat-open");
    $("chatPanel").classList.add("chat-open");

    renderConversations();
  };

  window.closeChat = function () {
    activeConvoId = null;
    $("inboxList").classList.remove("chat-open");
    $("chatPanel").classList.remove("chat-open");
    $("chatHeader").classList.add("hidden");
    $("chatReply").classList.add("hidden");
    $("chatBody").innerHTML = '<div class="chat-empty"><i class="fas fa-comments"></i><span>Select a conversation<br>to view messages</span></div>';
    renderConversations();
  };

  // ══════════ SEND REPLY ══════════
  window.sendReply = async function () {
    var input = $("replyInput");
    var text = input.value.trim();
    if (!text || !activeConvoId) return;

    var convo = conversations.find(function (c) { return c.id === activeConvoId; });
    if (!convo) return;

    // Add locally
    var msg = { text: text, direction: "outgoing", time: now().toISOString() };
    if (!convo.messages) convo.messages = [];
    convo.messages.push(msg);
    convo.lastMessage = text;
    convo.lastMessageTime = msg.time;
    if (convo.status === "new") convo.status = "in_progress";
    input.value = "";
    openConvo(activeConvoId);

    addLog("fas fa-paper-plane", "Replied to " + (convo.name || "Unknown") + " via " + platformLabel(convo.platform));

    // Send to webhook
    try {
      await fetch(CONFIG.SEND_REPLY_WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: convo.id,
          platform: convo.platform,
          recipientId: convo.recipientId || convo.senderId || "",
          message: text,
          agentName: currentUser ? currentUser.name : "Agent",
        }),
      });
    } catch (err) {
      console.error("Send reply error:", err);
      addLog("fas fa-exclamation-triangle", "Reply may not have been delivered: " + err.message);
    }
  };

  // ══════════ STATUS UPDATE ══════════
  window.updateConvoStatus = async function (status) {
    if (!activeConvoId) return;
    var convo = conversations.find(function (c) { return c.id === activeConvoId; });
    if (!convo) return;
    convo.status = status;
    renderConversations();
    addLog("fas fa-tag", "Changed " + (convo.name || "Unknown") + " status to " + status);

    try {
      await fetch(CONFIG.UPDATE_STATUS_WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: convo.id, status: status, assignedTo: currentUser ? currentUser.name : "" }),
      });
    } catch (e) { console.error(e); }
  };

  window.assignConvo = function () {
    if (!activeConvoId || !currentUser) return;
    var convo = conversations.find(function (c) { return c.id === activeConvoId; });
    if (!convo) return;
    convo.assignedTo = currentUser.name;
    addLog("fas fa-user-check", "Assigned " + (convo.name || "Unknown") + " to " + currentUser.name);
  };

  // ══════════ FACEBOOK COMMENTS ══════════
  window.fetchFbComments = async function () {
    try {
      var res = await fetch(CONFIG.FETCH_COMMENTS_WEBHOOK, { method: "GET" });
      var data = await res.json();
      allComments = Array.isArray(data) ? data : (data.comments || data.data || []);
      renderComments();
      addLog("fab fa-facebook", "Loaded " + allComments.length + " Facebook comments");
    } catch (err) {
      console.error(err);
      allComments = getDemoComments();
      renderComments();
      addLog("fas fa-info-circle", "Loaded demo comments (webhook not connected)");
    }
  };

  function renderComments() {
    var list = $("commentsList");
    if (!allComments.length) {
      list.innerHTML = '<div class="inbox-empty"><i class="fas fa-comment-dots"></i><span>No comments found</span></div>';
      return;
    }
    list.innerHTML = allComments.map(function (c, i) {
      return '<div class="comment-card">'
        + '<div class="comment-top">'
        + '<div class="comment-avatar">' + initials(c.userName || "?") + '</div>'
        + '<div><div class="comment-name">' + escHtml(c.userName || "Unknown") + '</div>'
        + '<div class="comment-time">' + timeStr(c.time) + '</div>'
        + '<div class="comment-post">On: ' + escHtml(c.postTitle || "Post") + '</div></div>'
        + '</div>'
        + '<div class="comment-body">' + escHtml(c.message || "") + '</div>'
        + '<div class="comment-actions">'
        + '<button class="comment-reply-btn" onclick="toggleCommentReply(' + i + ')"><i class="fas fa-reply"></i> Reply</button>'
        + '</div>'
        + '<div class="comment-reply-box" id="commentReply' + i + '">'
        + '<input type="text" placeholder="Write a reply..." id="commentReplyInput' + i + '">'
        + '<button onclick="sendCommentReply(' + i + ')">Send</button>'
        + '</div></div>';
    }).join("");
  }

  window.toggleCommentReply = function (i) {
    var box = $("commentReply" + i);
    box.classList.toggle("show");
  };

  window.sendCommentReply = async function (i) {
    var input = $("commentReplyInput" + i);
    var text = input.value.trim();
    if (!text) return;

    var comment = allComments[i];
    addLog("fab fa-facebook", "Replied to comment by " + (comment.userName || "Unknown"));
    input.value = "";
    $("commentReply" + i).classList.remove("show");

    try {
      await fetch(CONFIG.REPLY_COMMENT_WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          commentId: comment.id,
          postId: comment.postId,
          message: text,
          pageId: comment.pageId || "",
        }),
      });
    } catch (e) { console.error(e); }
  };

  window.filterComments = function (page, btn) {
    document.querySelectorAll("#commentFilters .filter-chip").forEach(function (b) { b.classList.remove("active"); });
    btn.classList.add("active");
    renderComments();
  };

  // ══════════ DEMO DATA (when webhooks not connected) ══════════
  function getDemoConversations() {
    return [
      {
        id: "wa-001", platform: "whatsapp", name: "Sarah Johnson", recipientId: "5926437296",
        status: "new", lastMessage: "Hi, I'd like to book a sofa cleaning please", lastMessageTime: new Date().toISOString(),
        messages: [
          { text: "Hi, I'd like to book a sofa cleaning please", direction: "incoming", time: new Date(Date.now() - 3600000).toISOString() },
          { text: "How much for a 3-seat sofa?", direction: "incoming", time: new Date(Date.now() - 3500000).toISOString() },
        ]
      },
      {
        id: "fb-001", platform: "messenger", name: "Michael Brown", recipientId: "fb_123",
        status: "in_progress", lastMessage: "When is the earliest available date?", lastMessageTime: new Date(Date.now() - 7200000).toISOString(),
        messages: [
          { text: "Hello! I need deep cleaning for my apartment", direction: "incoming", time: new Date(Date.now() - 86400000).toISOString() },
          { text: "Sure! We offer deep cleaning starting at a competitive rate. How many bedrooms?", direction: "outgoing", time: new Date(Date.now() - 80000000).toISOString() },
          { text: "It's a 2 bedroom apartment", direction: "incoming", time: new Date(Date.now() - 72000000).toISOString() },
          { text: "When is the earliest available date?", direction: "incoming", time: new Date(Date.now() - 7200000).toISOString() },
        ]
      },
      {
        id: "ig-001", platform: "instagram", name: "Lisa Marie", recipientId: "ig_456",
        status: "new", lastMessage: "Do you do pressure washing for driveways?", lastMessageTime: new Date(Date.now() - 1800000).toISOString(),
        messages: [
          { text: "Do you do pressure washing for driveways?", direction: "incoming", time: new Date(Date.now() - 1800000).toISOString() },
        ]
      },
      {
        id: "wa-002", platform: "whatsapp", name: "David Wilson", recipientId: "5926541234",
        status: "resolved", lastMessage: "Thank you for the great service!", lastMessageTime: new Date(Date.now() - 172800000).toISOString(),
        messages: [
          { text: "Hi, I booked carpet cleaning last week", direction: "incoming", time: new Date(Date.now() - 259200000).toISOString() },
          { text: "Yes! Your appointment is confirmed for Saturday", direction: "outgoing", time: new Date(Date.now() - 250000000).toISOString() },
          { text: "Thank you for the great service!", direction: "incoming", time: new Date(Date.now() - 172800000).toISOString() },
        ]
      },
      {
        id: "tt-001", platform: "tiktok", name: "cleaning_fan_gy", recipientId: "tt_789",
        status: "new", lastMessage: "Saw your video! How can I book?", lastMessageTime: new Date(Date.now() - 900000).toISOString(),
        messages: [
          { text: "Saw your video! How can I book?", direction: "incoming", time: new Date(Date.now() - 900000).toISOString() },
        ]
      },
    ];
  }

  function getDemoComments() {
    return [
      { id: "c1", postId: "p1", postTitle: "Before & After Sofa Cleaning", userName: "Amanda Peters", message: "Wow this looks amazing! How much do you charge?", time: new Date(Date.now() - 3600000).toISOString(), pageId: "livity" },
      { id: "c2", postId: "p1", postTitle: "Before & After Sofa Cleaning", userName: "Kevin R.", message: "Do you service the Linden area?", time: new Date(Date.now() - 7200000).toISOString(), pageId: "livity" },
      { id: "c3", postId: "p2", postTitle: "Commercial Cleaning Services", userName: "Office Manager GY", message: "We need weekly cleaning for our office. Please DM me.", time: new Date(Date.now() - 14400000).toISOString(), pageId: "livity" },
    ];
  }

  // ══════════ INIT ══════════
  function init() {
    // Clock
    updateClock();
    setInterval(updateClock, 1000);

    // Login events
    $("loginBtn").addEventListener("click", doLogin);
    $("loginPassword").addEventListener("keydown", function (e) { if (e.key === "Enter") doLogin(); });
    $("loginEmail").addEventListener("keydown", function (e) { if (e.key === "Enter") $("loginPassword").focus(); });

    // Logout
    $("btnLogout").addEventListener("click", doLogout);

    // Tab switching
    document.querySelectorAll(".comms-tab").forEach(function (tab) {
      tab.addEventListener("click", function () { switchTab(tab.dataset.tab); });
    });

    // Reply on Enter
    $("replyInput").addEventListener("keydown", function (e) { if (e.key === "Enter") sendReply(); });

    // Check saved session
    try {
      var saved = localStorage.getItem("livity_dash_user");
      if (saved) {
        currentUser = JSON.parse(saved);
        showDashboard();
      }
    } catch (e) {}
  }

  document.addEventListener("DOMContentLoaded", init);
})();
