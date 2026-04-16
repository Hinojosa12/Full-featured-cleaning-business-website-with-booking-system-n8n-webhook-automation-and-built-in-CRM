(function () {
  "use strict";

  var CONFIG = {
    FETCH_MESSAGES_WEBHOOK: "https://n8n-n8n.7toway.easypanel.host/webhook/livity-fetch-messages",
    SEND_REPLY_WEBHOOK: "https://n8n-n8n.7toway.easypanel.host/webhook/livity-send-reply",
    FETCH_COMMENTS_WEBHOOK: "https://n8n-n8n.7toway.easypanel.host/webhook/livity-fetch-comments",
    REPLY_COMMENT_WEBHOOK: "https://n8n-n8n.7toway.easypanel.host/webhook/livity-reply-comment",
    DELETE_MESSAGES_WEBHOOK: "https://n8n-n8n.7toway.easypanel.host/webhook/livity-delete-messages",
  };

  var STAFF = [
    { email: "admin@livityprojects.com", password: "Livity2026!", name: "Admin", role: "Manager" },
    { email: "staff@livityprojects.com", password: "Staff2026!", name: "Staff", role: "Customer Service" },
  ];

  var currentUser = null;
  var conversations = [];
  var allComments = [];
  var activeConvoId = null;
  var currentPlatformFilter = "all";
  var searchQuery = "";
  var activityLog = [];

  function $(id) { return document.getElementById(id); }
  function now() { return new Date(); }
  function timeStr(d) {
    if (!d) return "—";
    var dt = new Date(d);
    return dt.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
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
    return p === "messenger" ? "fab fa-facebook-messenger" : "fab fa-instagram";
  }
  function platformLabel(p) {
    return p === "messenger" ? "Messenger" : "Instagram";
  }

  function updateClock() {
    var n = now();
    $("liveTime").textContent = n.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true });
    $("liveDate").textContent = n.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  }

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

  window.doLogin = function () {
    var email = $("loginEmail").value.trim().toLowerCase();
    var pass = $("loginPassword").value;
    var err = $("loginError");
    var user = null;
    for (var i = 0; i < STAFF.length; i++) {
      if (STAFF[i].email.toLowerCase() === email && STAFF[i].password === pass) { user = STAFF[i]; break; }
    }
    if (!user) { err.textContent = "Invalid email or password."; err.style.display = "block"; return; }
    err.style.display = "none";
    currentUser = user;
    try { localStorage.setItem("livity_dash_user", JSON.stringify(user)); } catch (e) {}
    showDashboard();
  };

  window.doLogout = function () {
    currentUser = null;
    try { localStorage.removeItem("livity_dash_user"); } catch (e) {}
    $("loginScreen").style.display = "flex";
    $("dashboard").style.display = "none";
    $("loginEmail").value = "";
    $("loginPassword").value = "";
  };

  function showDashboard() {
    $("loginScreen").style.display = "none";
    $("dashboard").style.display = "flex";
    $("dashName").textContent = currentUser.name;
    $("dashRole").textContent = currentUser.role;
    $("dashAvatar").textContent = initials(currentUser.name);
    addLog("fas fa-sign-in-alt", currentUser.name + " signed in");
  }

  window.switchTab = function (tab) {
    document.querySelectorAll(".comms-tab").forEach(function (t) { t.classList.remove("active"); });
    if (tab === "inbox") {
      $("tabInbox").classList.add("active");
      $("panelInbox").style.display = "block";
      $("panelComments").style.display = "none";
    } else {
      $("tabComments").classList.add("active");
      $("panelInbox").style.display = "none";
      $("panelComments").style.display = "block";
    }
  };

  function filterAllowedConversations(convs) {
    return convs.filter(function(c) {
      var p = (c.platform || "").toLowerCase();
      return p === "messenger" || p === "instagram";
    });
  }

  window.fetchAllMessages = async function () {
    var btn = $("btnRefresh");
    btn.classList.add("loading");
    btn.disabled = true;
    try {
      var res = await fetch(CONFIG.FETCH_MESSAGES_WEBHOOK, { method: "GET" });
      if (!res.ok) throw new Error("HTTP " + res.status);
      var data = await res.json();
      var raw = Array.isArray(data) ? data : (data.conversations || data.data || []);
      conversations = filterAllowedConversations(raw);
      updateStats();
      renderConversations();
      addLog("fas fa-download", "Loaded " + conversations.length + " conversations");
    } catch (err) {
      console.error("Fetch messages error:", err);
      addLog("fas fa-exclamation-triangle", "Failed to load messages: " + err.message);
      conversations = [];
      updateStats();
      renderConversations();
    } finally {
      btn.classList.remove("loading");
      btn.disabled = false;
    }
  };

  function updateStats() {
    var counts = { messenger: 0, instagram: 0 };
    conversations.forEach(function (c) {
      var p = (c.platform || "").toLowerCase();
      if (counts[p] !== undefined) counts[p]++;
    });
    $("statMessenger").textContent = counts.messenger;
    $("statInstagram").textContent = counts.instagram;
    $("statTotal").textContent = conversations.length;
  }

  function renderConversations() {
    var list = $("inboxList");
    var filtered = conversations.filter(function (c) {
      var p = (c.platform || "").toLowerCase();
      if (currentPlatformFilter !== "all" && p !== currentPlatformFilter) return false;
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
      var p = (c.platform || "messenger").toLowerCase();
      var isActive = c.id === activeConvoId ? " active" : "";
      var lastMsg = c.lastMessage || (c.messages && c.messages.length ? c.messages[c.messages.length-1].text : "No messages");
      var lastTime = c.lastMessageTime || (c.messages && c.messages.length ? c.messages[c.messages.length-1].time : "");
      return '<div class="convo-item' + isActive + '" onclick="openConvo(\'' + c.id + '\')">'
        + '<div class="convo-avatar ' + p + '"><i class="' + platformIcon(p) + '"></i></div>'
        + '<div class="convo-info">'
        + '<div class="convo-name">' + escHtml(c.name || "Unknown") + '</div>'
        + '<div class="convo-preview">' + escHtml(lastMsg).substring(0, 50) + '</div>'
        + '</div>'
        + '<div class="convo-meta">'
        + '<div class="convo-time">' + timeStr(lastTime) + '</div>'
        + '</div></div>';
    }).join("");
  }

  window.filterInbox = function (platform, btn) {
    currentPlatformFilter = platform;
    document.querySelectorAll("#inboxFilters .filter-chip").forEach(function (b) { b.classList.remove("active"); });
    btn.classList.add("active");
    renderConversations();
  };

  window.searchInbox = function (q) {
    searchQuery = q;
    renderConversations();
  };

  window.openConvo = function (id) {
    activeConvoId = id;
    var convo = conversations.find(function (c) { return c.id === id; });
    if (!convo) return;
    var p = (convo.platform || "messenger").toLowerCase();

    $("chatHeader").style.display = "flex";
    $("chatReply").style.display = "flex";
    $("chatName").textContent = convo.name || "Unknown";
    $("chatPlatform").textContent = platformLabel(p);
    $("chatPlatform").className = "chat-contact-platform " + p;
    $("chatAvatar").innerHTML = '<i class="' + platformIcon(p) + '"></i>';
    $("replyPlatform").textContent = platformLabel(p);
    var btnDelete = $("btnDelete");
    if (btnDelete) btnDelete.style.display = "flex";

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

    $("inboxList").classList.add("chat-open");
    document.querySelector(".chat-panel").classList.add("chat-open");
    renderConversations();
  };

  window.closeChat = function () {
    activeConvoId = null;
    $("inboxList").classList.remove("chat-open");
    document.querySelector(".chat-panel").classList.remove("chat-open");
    $("chatHeader").style.display = "none";
    $("chatReply").style.display = "none";
    var btnDelete = $("btnDelete");
    if (btnDelete) btnDelete.style.display = "none";
    $("chatBody").innerHTML = '<div class="chat-empty"><i class="fas fa-comments"></i><span>Select a conversation<br>to view messages</span></div>';
    renderConversations();
  };

  window.sendReply = async function () {
    var input = $("replyInput");
    var text = input.value.trim();
    if (!text || !activeConvoId) return;
    var convo = conversations.find(function (c) { return c.id === activeConvoId; });
    if (!convo) return;
    var msg = { text: text, direction: "outgoing", time: now().toISOString() };
    if (!convo.messages) convo.messages = [];
    convo.messages.push(msg);
    convo.lastMessage = text;
    convo.lastMessageTime = msg.time;
    input.value = "";
    openConvo(activeConvoId);
    addLog("fas fa-paper-plane", "Replied to " + (convo.name || "Unknown") + " via " + platformLabel(convo.platform));
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

  window.deleteConversation = async function () {
    if (!activeConvoId) return;
    var convo = conversations.find(function (c) { return c.id === activeConvoId; });
    if (!convo) return;
    if (!confirm('Delete conversation with ' + (convo.name || 'Unknown') + '?')) return;
    try {
      await fetch(CONFIG.DELETE_MESSAGES_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senderId: convo.senderId })
      });
      conversations = conversations.filter(function (c) { return c.id !== activeConvoId; });
      closeChat();
      renderConversations();
      updateStats();
      addLog('fas fa-trash', 'Deleted conversation with ' + (convo.name || 'Unknown'));
    } catch (e) {
      console.error('Delete error:', e);
      addLog('fas fa-exclamation-triangle', 'Failed to delete: ' + e.message);
    }
  };

  window.assignConvo = function () {
    if (!activeConvoId || !currentUser) return;
    var convo = conversations.find(function (c) { return c.id === activeConvoId; });
    if (!convo) return;
    convo.assignedTo = currentUser.name;
    addLog("fas fa-user-check", "Assigned " + (convo.name || "Unknown") + " to " + currentUser.name);
  };

  window.fetchFbComments = async function () {
    try {
      var res = await fetch(CONFIG.FETCH_COMMENTS_WEBHOOK, { method: "GET" });
      var data = await res.json();
      allComments = Array.isArray(data) ? data : (data.comments || data.data || []);
      renderComments();
      addLog("fab fa-facebook", "Loaded " + allComments.length + " Facebook comments");
    } catch (err) {
      console.error(err);
      allComments = [];
      renderComments();
      addLog("fas fa-exclamation-triangle", "Failed to load comments: " + err.message);
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
        body: JSON.stringify({ commentId: comment.id, postId: comment.postId, message: text, pageId: comment.pageId || "" }),
      });
    } catch (e) { console.error(e); }
  };

  window.filterComments = function (page, btn) {
    document.querySelectorAll("#commentFilters .filter-chip").forEach(function (b) { b.classList.remove("active"); });
    btn.classList.add("active");
    renderComments();
  };

  function init() {
    updateClock();
    setInterval(updateClock, 1000);
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
