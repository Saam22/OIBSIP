(function () {
  "use strict";

  var USERS_KEY = "auth_users";
  var SESSION_KEY = "auth_session";

  var isDashboard = document.body.dataset.page === "dashboard" ||
    /dashboard\.html$/.test(window.location.pathname);

  function getUsers() {
    try {
      return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  function getSession() {
    return localStorage.getItem(SESSION_KEY);
  }

  function setSession(userId) {
    localStorage.setItem(SESSION_KEY, userId);
  }

  function clearSession() {
    localStorage.removeItem(SESSION_KEY);
  }

  function randomSalt() {
    var arr = new Uint8Array(16);
    crypto.getRandomValues(arr);
    return Array.from(arr, function (b) {
      return b.toString(16).padStart(2, "0");
    }).join("");
  }

  function sha256Hex(text) {
    return crypto.subtle.digest("SHA-256", new TextEncoder().encode(text)).then(function (buffer) {
      return Array.from(new Uint8Array(buffer), function (b) {
        return b.toString(16).padStart(2, "0");
      }).join("");
    });
  }

  function hashPassword(password, salt) {
    return sha256Hex(salt + "::" + password + "::" + salt);
  }

  function findUser(identifier) {
    var id = String(identifier || "").trim().toLowerCase();
    return getUsers().find(function (u) {
      return u.username.toLowerCase() === id || u.email.toLowerCase() === id;
    });
  }

  function validatePassword(password) {
    var errors = [];
    if (password.length < 8) {
      errors.push("at least 8 characters");
    }
    if (!/[0-9]/.test(password)) {
      errors.push("at least one number");
    }
    return errors;
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function showBox(box, message) {
    box.textContent = message;
    box.classList.remove("hidden");
  }

  function hideBox(box) {
    box.textContent = "";
    box.classList.add("hidden");
  }

  function switchTab(activeTab) {
    document.querySelectorAll(".tab").forEach(function (tab) {
      tab.classList.toggle("active", tab.dataset.tab === activeTab);
    });
    document.getElementById("loginForm").classList.toggle("hidden", activeTab !== "login");
    document.getElementById("registerForm").classList.toggle("hidden", activeTab !== "register");
    hideBox(document.getElementById("errorBox"));
    hideBox(document.getElementById("successBox"));
  }

  function showSplash() {
    var splash = document.getElementById("splash");
    var app = document.getElementById("app");
    if (!splash) return;
    setTimeout(function () {
      splash.classList.add("fade-out");
      app.classList.remove("hidden");
      setTimeout(function () {
        splash.style.display = "none";
      }, 600);
    }, 2000);
  }

  function initAuthPage() {
    if (getSession()) {
      window.location.replace("dashboard.html");
      return;
    }
    showSplash();

    var errorBox = document.getElementById("errorBox");
    var successBox = document.getElementById("successBox");

    document.querySelectorAll(".tab").forEach(function (tab) {
      tab.addEventListener("click", function () {
        switchTab(tab.dataset.tab);
      });
    });

    document.getElementById("goRegister").addEventListener("click", function (e) {
      e.preventDefault();
      switchTab("register");
    });

    document.getElementById("goLogin").addEventListener("click", function (e) {
      e.preventDefault();
      switchTab("login");
    });

    document.getElementById("registerForm").addEventListener("submit", async function (e) {
      e.preventDefault();
      hideBox(errorBox);
      hideBox(successBox);

      var username = document.getElementById("regUsername").value.trim();
      var email = document.getElementById("regEmail").value.trim();
      var password = document.getElementById("regPassword").value;
      var confirm = document.getElementById("regConfirm").value;

      if (!username || !email || !password || !confirm) {
        showBox(errorBox, "All fields are required.");
        return;
      }
      if (!isValidEmail(email)) {
        showBox(errorBox, "Please enter a valid email address.");
        return;
      }
      var pwdErrors = validatePassword(password);
      if (pwdErrors.length > 0) {
        showBox(errorBox, "Password must contain " + pwdErrors.join(" and ") + ".");
        return;
      }
      if (password !== confirm) {
        showBox(errorBox, "Passwords do not match.");
        return;
      }
      if (findUser(username) || getUsers().some(function (u) { return u.email.toLowerCase() === email.toLowerCase(); })) {
        showBox(errorBox, "This username or email is already registered. Please try a different one.");
        return;
      }

      var salt = randomSalt();
      var hash = await hashPassword(password, salt);
      var users = getUsers();
      var user = {
        id: salt + "-" + Date.now(),
        username: username,
        email: email,
        salt: salt,
        hash: hash,
        createdAt: new Date().toISOString()
      };
      users.push(user);
      saveUsers(users);

      switchTab("login");
      showBox(successBox, "Registration successful! You can now log in.");
      document.getElementById("registerForm").reset();
    });

    document.getElementById("loginForm").addEventListener("submit", async function (e) {
      e.preventDefault();
      hideBox(errorBox);
      hideBox(successBox);

      var identifier = document.getElementById("loginId").value.trim();
      var password = document.getElementById("loginPassword").value;

      if (!identifier || !password) {
        showBox(errorBox, "Please enter your credentials.");
        return;
      }

      var user = findUser(identifier);
      var valid = false;
      if (user) {
        var hash = await hashPassword(password, user.salt);
        valid = hash === user.hash;
      }

      if (!valid) {
        showBox(errorBox, "Invalid username/email or password. Please try again.");
        document.getElementById("loginPassword").value = "";
        return;
      }

      setSession(user.id);
      window.location.replace("dashboard.html");
    });
  }

  function initDashboard() {
    var user = null;
    var id = getSession();
    if (id) {
      user = getUsers().find(function (u) { return u.id === id; }) || null;
    }
    if (!user) {
      window.location.replace("index.html");
      return;
    }

    document.getElementById("welcomeName").textContent = user.username;
    document.getElementById("avatar").textContent = user.username.charAt(0).toUpperCase();
    var meta = document.getElementById("userMeta");
    meta.innerHTML = "";
    ["Username", "Email", "Registered"].forEach(function (label) {
      var value = label === "Username" ? user.username
        : label === "Email" ? user.email
        : new Date(user.createdAt).toLocaleDateString();
      var row = document.createElement("div");
      row.className = "meta-row";
      row.innerHTML = "<span>" + label + "</span><strong>" + value + "</strong>";
      meta.appendChild(row);
    });

    document.getElementById("logoutBtn").addEventListener("click", function () {
      clearSession();
      window.location.replace("index.html");
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    if (isDashboard) {
      initDashboard();
    } else {
      initAuthPage();
    }
  });
})();
