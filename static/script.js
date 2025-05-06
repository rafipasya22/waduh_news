const catcontainer = document.querySelectorAll(".keyword-links");
catcontainer.forEach((cat) => {
  const category = cat.textContent.trim();
  console.log(category);
  fetchTopKeywords(category);
});

async function fetchTopKeywords(cat) {
  try {
    const response = await fetch(
      `/api/popular-keywords/${encodeURIComponent(cat)}`
    );
    const data = await response.json();

    const trs = document.querySelectorAll(".keyword-links");

    trs.forEach((tr) => {
      tr.classList.add(
        "d-flex",
        "align-items-start",
        "justify-content-start",
        "flex-column",
        "mx-3"
      );

      if (tr.textContent.trim() === cat) {
        console.log("Container ditemukan");
        data.top_keywords.forEach((item) => {
          const td = document.createElement("td");
          const link = document.createElement("a");
          const capItem =
            item.word.charAt(0).toUpperCase() +
            item.word.slice(1).toLowerCase();
          link.textContent = capItem;
          link.href = `/news/more-categories/search?query=${encodeURIComponent(item.word)}&category=${encodeURIComponent(cat.toLowerCase())}`;
          td.appendChild(link);
          tr.appendChild(td);
        });
      } else {
        console.log("gaada yang cocok");
      }
    });
  } catch (error) {
    console.error("Failed to fetch top keywords:", error);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const bookmarkBtn = document.querySelectorAll(".bookmarkbtn");

  bookmarkBtn.forEach(function (btn) {
    function updateText() {
      const isPressed = btn.getAttribute("aria-pressed") === "true";
      btn.innerHTML = `
    <span class="material-symbols-outlined me-2">
      ${isPressed ? "bookmark_added" : "bookmark"}
    </span>
    ${isPressed ? "Post Bookmarked" : "Bookmark this post"}
    `;
    }

    updateText();

    btn.addEventListener("click", function () {
      setTimeout(updateText, 10);
    });
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const likeBtnContainer = document.querySelector(".likebutton");
  const likeBtn = likeBtnContainer.querySelector(".likebtn");

  function updateTextLike() {
    const isPressed = likeBtn.getAttribute("aria-pressed") === "true";
    likeBtn.innerHTML = `
    <span class="material-symbols-outlined me-2"> thumb_up </span>
    ${isPressed ? "Liked" : "Like"}
    `;
  }

  updateTextLike();

  likeBtn.addEventListener("click", function () {
    setTimeout(updateTextLike, 10);
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const dislikeBtnContainer = document.querySelector(".dislikebutton");
  const dislikeBtn = dislikeBtnContainer.querySelector(".dislikebtn");

  function updateTextDislike() {
    const isPressed = dislikeBtn.getAttribute("aria-pressed") === "true";
    dislikeBtn.innerHTML = `
    <span class="material-symbols-outlined me-2"> thumb_down </span>
    ${isPressed ? "Disliked" : "Dislike"}
    `;
  }

  updateTextDislike();

  dislikeBtn.addEventListener("click", function () {
    setTimeout(updateTextDislike, 10);
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const bookmarkBtnContainer = document.querySelectorAll(".bookmark");
  bookmarkBtnContainer.forEach(function (btn_mid) {
    function updateTextMid() {
      const bookmarkBtn_mid = btn_mid.querySelector(".bookmark-icon");
      const bookmarkInput = bookmarkBtn_mid.querySelector("input");
      const bookmarkBtnText = btn_mid.querySelector("small");
      const bookmarkBtnIcon = bookmarkBtn_mid.querySelector("span");
      const isChecked = bookmarkInput.checked;
      if (isChecked) {
        bookmarkBtnText.innerHTML = "Saved";
        bookmarkBtnIcon.innerHTML = "bookmark_added";
      } else {
        bookmarkBtnText.innerHTML = "Bookmark";
        bookmarkBtnIcon.innerHTML = "bookmark";
      }
    }
    updateTextMid();

    btn_mid.addEventListener("click", function () {
      setTimeout(updateTextMid, 10);
    });
  });
});

const navbar = document.querySelector(".navbar");
const wlr = document.querySelector(".wlr");

window.addEventListener("scroll", () => {
  if (window.scrollY < 100) {
    navbar.classList.remove("hidden");
    wlr.classList.remove("hidden");
    wlr.classList.remove("showed");
  } else {
    navbar.classList.add("hidden");
    wlr.classList.add("hidden");
    wlr.classList.remove("showed");
  }
});

window.addEventListener("mousemove", (e) => {
  if ((e.clientY <= 100) & (window.scrollY >= 100)) {
    wlr.classList.add("showed");
  }
});

const searchContainer = document.getElementById("container-search");
const searchIcon = document.getElementById("icon-search");
const searchInput = document.getElementById("input-search");

searchIcon.addEventListener("click", () => {
  searchContainer.classList.add("expanded");
  searchInput.focus();
});

document.addEventListener("click", (event) => {
  if (!searchContainer.contains(event.target)) {
    searchContainer.classList.remove("expanded");
  }
});

const themeToggle = document.getElementById("theme-toggle");
const body = document.body;

document.addEventListener("DOMContentLoaded", () => {
  const isDarkMode = localStorage.getItem("theme") === "dark";
  if (isDarkMode) {
    body.classList.add("dark");
    themeToggle.checked = true;
  } else {
    body.classList.remove("dark");
    themeToggle.checked = false;
  }
});

themeToggle.addEventListener("change", () => {
  if (themeToggle.checked) {
    body.classList.add("dark");
    localStorage.setItem("theme", "dark");
  } else {
    body.classList.remove("dark");
    localStorage.setItem("theme", "light");
  }
});

document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".cat-btn a").forEach((btn) => {
    btn.addEventListener("click", function (e) {
      e.preventDefault();

      let categoryContainer = this.closest(".news-cat");
      let preferredTopics = document.querySelector(".preferred-topics");
      let availableTopics = document.querySelector(".available-topics");

      if (preferredTopics.contains(categoryContainer)) {
        availableTopics
          .querySelector(".categories-edit")
          .appendChild(categoryContainer);
        this.querySelector("span").style.transform = "rotate(0deg)";
      } else {
        preferredTopics.appendChild(categoryContainer);
        this.querySelector("span").style.transform = "rotate(45deg)";
      }
    });
  });
});

document
  .querySelectorAll(".dropdown-menu.sorty .dropdown-item")
  .forEach((item) => {
    item.addEventListener("click", function (e) {
      e.preventDefault();
      const selectedText = this.textContent;
      document.querySelector(".sorty-dropdown-title").textContent =
        selectedText;
    });
  });

function copyLink() {
  const copyText = document.getElementById("copyLinkInput");
  copyText.select();
  copyText.setSelectionRange(0, 99999);
  document.execCommand("copy");

  const successMsg = document.getElementById("copySuccess");
  successMsg.classList.remove("d-none");
  setTimeout(() => {
    successMsg.classList.add("d-none");
  }, 2000);
}

function copyLink2() {
  const copyText = document.getElementById("copyLinkInput2");
  copyText.select();
  copyText.setSelectionRange(0, 99999);
  document.execCommand("copy");

  const successMsg = document.getElementById("copySuccess2");
  successMsg.classList.remove("d-none");
  setTimeout(() => {
    successMsg.classList.add("d-none");
  }, 2000);
}

function updateCharCount() {
  const textarea = document.getElementById("comment");
  const remaining = 1000 - textarea.value.length;
  document.getElementById("charRemaining").textContent = remaining;
}

function updateCharCount2() {
  const textarea = document.getElementById("report");
  const now = 0 + textarea.value.length;
  document.getElementById("MaxChar").textContent = now;
}

function previewImage(event) {
  const file = event.target.files[0];

  if (file && file.type.startsWith("image/")) {
    const reader = new FileReader();
    reader.onload = function () {
      const imagePreview = document.getElementById("preview-img");
      imagePreview.src = reader.result;
    };
    reader.readAsDataURL(file);
  } else {
    const imagePreview = document.getElementById("preview-img");
    imagePreview.src = "../{{ user.ProfilePhoto }}";
  }
}

document
  .getElementById("passform")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const formData = new FormData(event.target);

    try {
      const response = await fetch("/edit/password", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (!response.ok) {
        document.getElementById("msg-error").textContent =
          data.detail || "An unknown error occurred";
        document.getElementById("msg-error").style.display = "block";
      } else {
        alert("Account created successfully!");
        document.getElementById("formsignup").reset();
        document.getElementById("msg-error").style.display = "none";
      }
    } catch (error) {
      document.getElementById("msg-error").textContent =
        "Network error, please try again.";
      document.getElementById("msg-error").style.display = "block";
    }
  });

document
  .querySelector(".btn-save-changes")
  .addEventListener("click", function () {
    let preferred = document.querySelectorAll(".preferred-topics .news-cat");
    let selectedTopics = [];

    preferred.forEach((cat) => {
      selectedTopics.push(cat.getAttribute("data-topic"));
    });
    console.log("Selected topics:", selectedTopics);
    fetch("/api/save-preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        topics: selectedTopics,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Saving Preferences Failed: ");
        return res.json();
      })
      .then((data) => {
        console.log("Preferences Saved:", data);
        location.reload();
      })
      .catch((err) => console.error(err));
  });

document.addEventListener("DOMContentLoaded", function () {
  fetch("/api/user-preferences")
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        console.error(data.error);
        return;
      }

      const preferredTopics = data.preferred_topics;
      const allTopics = ["Sports", "Science", "Technology", "Health", "Business", "Entertainment"];

      const availableTopicsContainer =
        document.querySelector("#available-topics");
      const preferredTopicsContainer =
        document.querySelector("#preferred-topics");

      allTopics.forEach((topic) => {
        const topicName = topic.replace(/\s+/g, "-");
        const topicDiv = document.createElement("div");
        topicDiv.classList.add(
          "news-cat",
          topicName,
          "d-flex",
          "justify-content-between",
          "align-items-center",
          "mx-2",
          "my-2"
        );
        topicDiv.setAttribute("data-topic", topic);

        const catTextDiv = document.createElement("div");
        catTextDiv.classList.add("cat-text");
        catTextDiv.innerHTML = `<p class="px-1">${topic}</p>`;

        const catBtnDiv = document.createElement("div");
        catBtnDiv.classList.add("cat-btn");
        const aTag = document.createElement("a");
        aTag.href = "#";
        aTag.classList.add(
          "d-flex",
          "justify-content-center",
          "align-items-center"
        );

        const span = document.createElement("span");
        span.classList.add("material-symbols-outlined");
        span.textContent = "add";

        aTag.appendChild(span);
        catBtnDiv.appendChild(aTag);
        topicDiv.appendChild(catTextDiv);
        topicDiv.appendChild(catBtnDiv);

        if (preferredTopics.includes(topic)) {
          preferredTopicsContainer.appendChild(topicDiv);
          span.style.transform = "rotate(45deg)";
        } else {
          availableTopicsContainer.appendChild(topicDiv);
        }

        aTag.addEventListener("click", function (e) {
          e.preventDefault();

          if (preferredTopics.includes(topic)) {
            preferredTopicsContainer.removeChild(topicDiv);
            availableTopicsContainer.appendChild(topicDiv);
            span.style.transform = "rotate(0deg)";
            preferredTopics.splice(preferredTopics.indexOf(topic), 1);

            fetch(`/api/remove-preference/${encodeURIComponent(topic)}`, {
              method: "DELETE",
            })
              .then((res) => res.json())
              .then((data) => {
                if (data.error) {
                  console.error(data.error);
                } else {
                  console.log(`Topic ${topic} removed successfully.`);
                }
              })
              .catch((error) => {
                console.error("Error removing topic:", error);
              });
          } else {
            availableTopicsContainer.removeChild(topicDiv);
            preferredTopicsContainer.appendChild(topicDiv);
            span.style.transform = "rotate(45deg)";
            preferredTopics.push(topic);
          }
        });
      });
    })
    .catch((error) => {
      console.error("Error fetching user preferences:", error);
    });
});

document.addEventListener("DOMContentLoaded", function () {
  fetch("/api/user-preferences")
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        console.error(data.error);
        return;
      }

      const topContainer = document.querySelector(".cat-container.top");
      const bottomContainer = document.querySelector(".cat-container.bottom");
      let preferredTopics = data.preferred_topics;

      if (!preferredTopics || preferredTopics.length === 0) {
        const emptyMessage = document.createElement("p");
        emptyMessage.textContent = "No Topic Has Been Selected";
        emptyMessage.classList.add("text-muted", "mx-2", "my-4");
        topContainer.appendChild(emptyMessage);
        return;
      }

      if (preferredTopics.length > 6) {
        for (let i = preferredTopics.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [preferredTopics[i], preferredTopics[j]] = [
            preferredTopics[j],
            preferredTopics[i],
          ];
        }
      }

      const selectedTopics = preferredTopics.slice(0, 6);
      const topTopics = selectedTopics.slice(0, 3);
      const bottomTopics = selectedTopics.slice(3, 6);

      const createTopicDiv = (topic) => {
        const topicName = topic.replace(/\s+/g, "-");
        const div = document.createElement("div");
        div.classList.add(
          "news-cat",
          topicName,
          "d-flex",
          "justify-content-center",
          "align-items-center",
          "mx-2",
          "my-2"
        );
        div.innerHTML = `<p class="px-1">${topic}</p>`;
        return div;
      };

      topTopics.forEach((topic) => {
        topContainer.appendChild(createTopicDiv(topic));
      });

      bottomTopics.forEach((topic) => {
        bottomContainer.appendChild(createTopicDiv(topic));
      });
    })
    .catch((error) => {
      console.error("Error fetching user preferences:", error);
    });
});
