async function fetchAndDisplayNews(event = null) {
  if (event && typeof event.preventDefault === "function") {
    event.preventDefault();
  }

  try {
    const response = await fetch("/api/user-bookmarks");
    const data = await response.json();

    if (data.error) {
      console.error(data.error);
      return;
    }

    const totalBookmarks = data.total_items
    const totalContainer = document.querySelector(".bookmark-numbers")
    totalContainer.innerHTML = totalBookmarks;

    const newsList = data.bookmarks;
    const containers = document.querySelectorAll(".bookmarked-posts-profile");

    if (!containers.length) {
      console.error("No containers found");
      return;
    }

    let postCount = 0;

    containers.forEach((container) => {
      container.innerHTML = "";

      const postsForContainer = newsList.slice(postCount, postCount + 2);

      postsForContainer.forEach((news) => {
        const redirect = `/api/baca-news/article/bookmarks/${encodeURIComponent(news.title)}`;
        const catClass =
          news.category.charAt(0).toUpperCase() +
          news.category.slice(1).toLowerCase();
        const postElement = document.createElement("div");
        postElement.classList.add(
          "post-mid",
          "d-flex",
          "justify-content-evenly",
          "flex-row",
          "mt-2",
          "mb-3"
        );

        postElement.innerHTML = `
          <div class="post-content">
            <a href="${redirect}" class="container-img">
              <img src="${
                news.imageUrl || "/static/Assets/img/default.jpg"
              }" alt="" />
            </a>

            <a href="${redirect}" class="post-text d-flex justify-content-start align-items-start flex-column px-3 pt-3">
              <div class="news-cat ${catClass} d-flex justify-content-center align-items-center mb-2">
                <p class="px-1">${news.category}</p>
              </div>
              <span class="title-mid">${news.title}</span>
            </a>
          </div>
          <div class="post-analytics-mid">
            <div class="views d-flex flex-column justify-content-center align-items-center mb-2">
              <span class="material-symbols-outlined"> visibility </span>
              <small>1.3K</small>
            </div>
            <div class="share d-flex flex-column justify-content-center align-items-center mb-2">
              <span class="material-symbols-outlined"> share </span>
              <small>1.3K</small>
            </div>
            <div class="likes d-flex flex-column justify-content-center align-items-center mb-2">
              <span class="material-symbols-outlined"> favorite </span>
              <small>1.3K</small>
            </div>
            <div class="bookmark d-flex flex-column justify-content-center align-items-center mb-2">
              <label class="bookmark-icon">
                <input type="checkbox" checked />
                <span class="material-symbols-outlined">bookmark</span>
              </label>
              <small>Bookmark</small>
            </div>
          </div>
        `;

        container.appendChild(postElement);
      });

      postCount += 2;
    });

    return newsList;
  } catch (error) {
    console.error("Error fetching news:", error);
  }
}

async function getlike() {
  const postBigContainers = document.querySelectorAll(".post-big");
  const postMidContainers = document.querySelectorAll(".post-mid");

  const titleList = [];

  postBigContainers.forEach((post) => {
    const titleElement = post.querySelector(".post-text-big");
    if (titleElement) {
      const title = titleElement.textContent.trim();
      if (title) {
        titleList.push(title);
      }
    }
  });

  postMidContainers.forEach((post) => {
    const titleElement = post.querySelector(".title-mid");
    if (titleElement) {
      const title = titleElement.textContent.trim();
      if (title) {
        titleList.push(title);
      }
    }
  });

  postBigContainers.forEach((post) => {
    getlikes(post, ".post-text-big");
  });

  postMidContainers.forEach((post) => {
    getlikes(post, ".title-mid");
  });

  async function getlikes(post, titleSelector) {
    const titleElement = post.querySelector(titleSelector);
    const title = titleElement?.textContent.trim();
    if (!title) return;

    const likeContainer = post.querySelector(".likes small");
    if (!likeContainer) return;

    try {
      const res = await fetch("/api/total_likes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ post_title: title }),
      });

      const result = await res.json();
      const total = result.total_likes || 0;

      likeContainer.textContent = total;
    } catch (err) {
      console.error("Checking Bookmarks Failed:", err);
    }
  }
}

async function get_total_like() {
  try {
    const response = await fetch("/api/profile/get_total_likes");
    const data = await response.json();

    if (data.error) {
      console.error(data.error);
      return;
    }

    const totalLikes = data.total_likes_by
    const totalContainer = document.querySelector(".like-numbers")
    totalContainer.innerHTML = totalLikes;
  } catch (err) {
    console.error("Getting Total Likes Failed:", err);
  }
}

document.addEventListener("DOMContentLoaded", async function () {
  const source = await fetchAndDisplayNews();
  
  await getlike();
  await get_total_like();

  const postBigContainers = document.querySelectorAll(".post-big");
  const postMidContainers = document.querySelectorAll(".post-mid");

  const titleList = [];

  postBigContainers.forEach((post) => {
    const titleElement = post.querySelector(".post-text-big");
    if (titleElement) {
      const title = titleElement.textContent.trim();
      if (title) {
        titleList.push(title);
      }
    }
  });

  postMidContainers.forEach((post) => {
    const titleElement = post.querySelector(".title-mid");
    if (titleElement) {
      const title = titleElement.textContent.trim();
      if (title) {
        titleList.push(title);
      }
    }
  });

  try {
    const res = await fetch("/api/check-bookmarks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ Titles: titleList }),
    });

    const result = await res.json();
    const bookmarkedTitles = result.bookmarked || [];

    postBigContainers.forEach((post) => {
      handleBookmark(
        post,
        ".post-text-big",
        ".bookmarkbtn",
        bookmarkedTitles,
        false
      );
    });

    postMidContainers.forEach((post) => {
      const title = post.querySelector(".title-mid")?.textContent.trim();
      handleBookmark(
        post,
        ".title-mid",
        ".bookmark-icon",
        bookmarkedTitles,
        true
      );
    });
  } catch (err) {
    console.error("Checking Bookmarks Failed:", err);
  }

  function handleBookmark(
    post,
    titleSelector,
    btnSelector,
    bookmarkedTitles,
    isCheckbox
  ) {
    const titleElement = post.querySelector(titleSelector);
    const title = titleElement?.textContent.trim();
    if (!title) return;

    const fetchArticle = async (title) => {
      try {
        const findArticle = source.find((item) => item.title === title);
        if (!findArticle) throw new Error("Article not found");

        const category = findArticle.category;

        const endpoint =
          category == "general"
            ? `/api/ambil-news2/general/${encodeURIComponent(title)}`
            : `/api/ambil-news2/headline/${encodeURIComponent(
                category
              )}/${encodeURIComponent(title)}`;

        const res = await fetch(endpoint);
        if (!res.ok) throw new Error("Failed to fetch article");

        const data = await res.json();
        return data;
      } catch (err) {
        console.error("Error fetching article:", err);
        throw err;
      }
    };

    if (isCheckbox) {
      const label = post.querySelector(btnSelector);
      const checkbox = label?.querySelector("input[type='checkbox']");
      const icon = label?.querySelector("span.material-symbols-outlined");
      const bookmarkText = post.querySelector(
        ".post-analytics-mid .bookmark small"
      );
      if (!label || !checkbox || !icon || !bookmarkText) return;

      const isBookmarked = bookmarkedTitles.includes(title);
      checkbox.checked = isBookmarked;
      updateIcon(icon, isBookmarked, bookmarkText);

      if (!checkbox.dataset.listenerAttached) {
        checkbox.addEventListener("change", async function () {
          console.log("Bookmarking checkbox triggered for title:", title);
          const checked = checkbox.checked;
          try {
            const articleData = await fetchArticle(title);
            const postData = articleData.news?.find(
              (article) => article.title === title
            );
            console.log("Title clicked:", title);
            console.log("Title matched:", postData?.title);

            console.log("Post data to send:", postData);

            if (!postData) throw new Error("Failed to fetch article");

            const res = await fetch(
              checked ? "/api/bookmark" : "/api/remove-bookmark",
              {
                method: checked ? "POST" : "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(
                  checked
                    ? {
                        Title: postData.title,
                        Author: postData.author,
                        Category: postData.category,
                        Published_at: postData.published_at,
                        Image_url: postData.image_url,
                        Content: postData.content,
                        Source_url: postData.source_url,
                        Source_name: postData.source_name,
                      }
                    : { Title: title }
                ),
              }
            );

            if (!res.ok) {
              alert("Cannot add or delete bookmark");
              checkbox.checked = !checked;
              return;
            }

            updateIcon(icon, checked, bookmarkText);
            alert(checked ? "Post Bookmarked!" : "Bookmark deleted!");
          } catch (err) {
            const articleData = await fetchArticle(title);
            const postData = articleData.news?.find(
              (article) => article.title === title
            );
            console.log("Title clicked:", title);
            console.log("Title matched:", postData?.title);

            console.log("Post data to send:", postData);

            if (!postData) {
              const res = await fetch("/api/remove-bookmark", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(
                  checked
                    ? {
                        Title: postData.title,
                        Author: postData.author,
                        Category: postData.category,
                        Published_at: postData.published_at,
                        Image_url: postData.image_url,
                        Content: postData.content,
                        Source_url: postData.source_url,
                        Source_name: postData.source_name,
                      }
                    : { Title: title }
                ),
              });

              if (!res.ok) {
                alert("Cannot add or delete bookmark");
                checkbox.checked = !checked;
                return;
              }

              updateIcon(icon, checked, bookmarkText);
              alert("Bookmark deleted!");
              
            }
            location.reload();
          }
        });
        checkbox.dataset.listenerAttached = "true";
      }
    } else {
      const btn = post.querySelector(btnSelector);
      if (!btn) return;

      const isBookmarked = bookmarkedTitles.includes(title);
      btn.classList.toggle("bookmarked", isBookmarked);
      updateText(btn);

      btn.addEventListener("click", async function (e) {
        e.preventDefault();

        try {
          const articleData = await fetchArticle(title);
          const postData = articleData.news?.[0];
          console.log(postData);

          if (!postData) {
            const res = await fetch("/api/remove-bookmark", {
              method: "DELETE",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ Title: title }),
            });

            if (!res.ok) {
              alert("Cannot delete bookmark");
              return;
            }

            btn.classList.remove("bookmarked");
            updateText(btn);
            alert("Bookmark deleted!");
            location.reload();
          }

          const bookmarkExists = bookmarkedTitles.includes(title);
          if (btn.classList.contains("bookmarked") && !bookmarkExists) {
            const res = await fetch("/api/remove-bookmark", {
              method: "DELETE",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ Title: title }),
            });

            if (!res.ok) {
              alert("Cannot delete bookmark");
              return;
            }

            btn.classList.remove("bookmarked");
            updateText(btn);
            alert("Bookmark deleted!");
          } else if (!btn.classList.contains("bookmarked") && !bookmarkExists) {
            const res = await fetch("/api/bookmark", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                Title: postData.title,
                Author: postData.author,
                Category: postData.category,
                Published_at: postData.published_at,
                Image_url: postData.image_url,
                Content: postData.content,
                Source_url: postData.source_url,
                Source_name: postData.source_name,
              }),
            });

            if (!res.ok) {
              alert("Cannot add bookmark");
              return;
            }

            btn.classList.add("bookmarked");
            updateText(btn);
            alert("Post Bookmarked!");
          }
        } catch (err) {
          console.error("Error:", err);
          alert("Cannot add or delete bookmark");
        }
      });
    }
  }

  function updateText(btn) {
    if (btn.classList.contains("bookmarked")) {
      btn.innerHTML = `
        <span class="material-symbols-outlined me-2">bookmark_added</span>
        Post Bookmarked
      `;
    } else {
      btn.innerHTML = `
        <span class="material-symbols-outlined me-2">bookmark</span>
        Bookmark this post
      `;
    }
  }

  function updateIcon(iconElement, isBookmarked, textElement) {
    iconElement.textContent = isBookmarked ? "bookmark_added" : "bookmark";
    textElement.textContent = isBookmarked ? "Saved" : "Bookmark";
  }
});
