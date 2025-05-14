async function loadnxtnews() {
  const headline = true;
  const currentCategory = document.body.dataset.category;
  console.log(currentCategory);

  try {
    const res = await fetch(
      `/api/ambil_nxtnews/${encodeURIComponent(currentCategory)}`
    );
    const data = await res.json();

    if (data.error) {
      console.error(data.error);
      return;
    }

    const articles = data.news;

    if (articles.length === 0) return;

    const randomIndex = Math.floor(Math.random() * articles.length);
    const nxtNews = articles[randomIndex];
    console.log(nxtNews);

    const nxtNewsContainer = document.querySelector(
      ".sports.nxt-stories .post-mid"
    );
    const nxtNewsContent = nxtNewsContainer.querySelector(".post-content");
    const nxtNewsRedirectImg = nxtNewsContent.querySelector(".container-img");
    const nxtNewsImg = nxtNewsContent.querySelector(".container-img img");
    const nxtNewsRedirect = nxtNewsContent.querySelector(".post-text");
    const nxtNewsText = nxtNewsContent.querySelector(".post-text .title-mid");
    const cat = document.querySelector(".post-text .news-cat");
    const catText = document.querySelector(".post-text .news-cat p");
    const capCatText =
      nxtNews.category.charAt(0).toUpperCase() +
      nxtNews.category.slice(1).toLowerCase();

    if (cat) {
      cat.classList.add(capCatText);
      catText.innerHTML = capCatText;
    }
    if (nxtNewsImg)
      nxtNewsImg.src = nxtNews.imageUrl || "../static/Assets/img/default.jpg";
    if (nxtNewsText) {
      nxtNewsText.innerHTML = nxtNews.title;
      nxtNewsRedirect.href = `/api/baca-news/headline/${encodeURIComponent(
        nxtNews.category
      )}/${encodeURIComponent(nxtNews.title)}`;
      nxtNewsRedirectImg.href = `/api/baca-news/headline/${encodeURIComponent(
        nxtNews.category
      )}/${encodeURIComponent(nxtNews.title)}`;
    }

    return {
      headline,
      postCategory: nxtNews.category,
      postTitle: nxtNews.title,
    };
  } catch (err) {
    console.error("Error fetching news:", err);
  }
}

let headlineInfoList = [];

async function bookmark_mid() {
  const result = await loadnxtnews();
  if (result) headlineInfoList.push(result);

  const postMidContainers = document.querySelectorAll(".post-mid");

  const titleList = [];

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
        const matched = headlineInfoList.find(
          (info) => info.postTitle === title
        );

        const endpoint = matched
          ? `/api/ambil-news2/headline/${encodeURIComponent(
              matched.postCategory
            )}/${encodeURIComponent(title)}`
          : `/api/ambil-news2/general/${encodeURIComponent(title)}`;

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

            if (!postData) throw new Error("Article data not found");

            const bookmarkExists = bookmarkedTitles.includes(title);
            if (checked && bookmarkExists) {
              alert("This post is already bookmarked.");
              checkbox.checked = false;
              return;
            }

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
            console.error("Error:", err);
            checkbox.checked = !checked;
            alert("Cannot add or delete bookmark");
          }
        });
        checkbox.dataset.listenerAttached = "true";
      }
    }
  }

  function updateIcon(iconElement, isBookmarked, textElement) {
    iconElement.textContent = isBookmarked ? "bookmark_added" : "bookmark";
    textElement.textContent = isBookmarked ? "Saved" : "Bookmark";
  }
}

const dataContainer = document.getElementById("articledata");
const articleData = {
  title: dataContainer.dataset.title,
  author: dataContainer.dataset.author,
  category: dataContainer.dataset.category,
  published_at: dataContainer.dataset.publishedAt,
  image_url: dataContainer.dataset.imageUrl,
  content: dataContainer.dataset.content,
  source_url: dataContainer.dataset.sourceUrl,
  source_name: dataContainer.dataset.sourceName,
};

async function bookmark_post() {
  const postBigContainers = document.querySelectorAll(".title-container");

  const titleList = [];

  postBigContainers.forEach((post) => {
    const titleElement = post.querySelector(".news-title h2");
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
      handleBookmark(post, ".news-title h2", ".bookmarkbtn", bookmarkedTitles);
    });
  } catch (err) {
    console.error("Checking Bookmarks Failed:", err);
  }

  function handleBookmark(post, titleSelector, btnSelector, bookmarkedTitles) {
    const titleElement = post.querySelector(titleSelector);
    const title = titleElement?.textContent.trim();
    if (!title) return;

    const btn = post.querySelector(btnSelector);
    if (!btn) return;

    const isBookmarked = bookmarkedTitles.includes(title);
    btn.classList.toggle("bookmarked", isBookmarked);
    updateText(btn);

    btn.addEventListener("click", async function (e) {
      e.preventDefault();

      try {
        const bookmarkExists = bookmarkedTitles.includes(title);
        const checkBookmarked = btn.classList.contains("bookmarked");
        console.log("waduh: ", bookmarkExists);
        console.log("wadaw:", checkBookmarked);
        if (btn.classList.contains("bookmarked") && bookmarkExists) {
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
              Title: articleData.title,
              Author: articleData.author,
              Category: articleData.category,
              Published_at: articleData.published_at,
              Image_url: articleData.image_url,
              Content: articleData.content,
              Source_url: articleData.source_url,
              Source_name: articleData.source_name,
            }),
          });

          if (!res.ok) {
            alert("Cannot add bookmark");
            return;
          }

          btn.classList.add("bookmarked");
          updateText(btn);
          alert("Post Bookmarked!");
        } else if (!btn.classList.contains("bookmarked") && bookmarkExists) {
          const res = await fetch("/api/bookmark", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              Title: articleData.title,
              Author: articleData.author,
              Category: articleData.category,
              Published_at: articleData.published_at,
              Image_url: articleData.image_url,
              Content: articleData.content,
              Source_url: articleData.source_url,
              Source_name: articleData.source_name,
            }),
          });

          if (!res.ok) {
            alert("Cannot add bookmark");
            return;
          }

          btn.classList.add("bookmarked");
          updateText(btn);
          alert("Post Bookmarked!");
        } else if (btn.classList.contains("bookmarked") && !bookmarkExists) {
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
        }
      } catch (err) {
        console.error("Error:", err);
        alert("Cannot add or delete bookmark");
      }
    });
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
}

async function like_post() {
  const postBigContainers = document.querySelector(".title-container");

  const titleElement = postBigContainers.querySelector(".news-title h2");
  const title = titleElement.textContent.trim();

  try {
    const res = await fetch("/api/check-likes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ post_title: title }),
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const result = await res.json();
    const likedTitles = result.likes || [];

    if (!result || !("likes" in result)) {
      throw new Error("Invalid response: missing 'likes'");
    }

    console.log(likedTitles);

    handleLikes(postBigContainers, ".news-title h2", ".likebtn", likedTitles);
  } catch (err) {
    console.error("Checking Bookmarks Failed:", err);
  }

  function handleLikes(post, titleSelector, btnSelector, likedTitles) {
    const titleElement = post.querySelector(titleSelector);
    const title = titleElement?.textContent.trim();
    if (!title) return;

    const btn = post.querySelector(btnSelector);
    if (!btn) return;

    const dislikebtn = post.querySelector(".dislikebtn");
    if (!dislikebtn) return;

    const isExist = likedTitles.includes(title);
    btn.classList.toggle("pressed", isExist);
    updateTextLike(btn);

    btn.addEventListener("click", async function (e) {
      e.preventDefault();

      const isLiked = btn.classList.contains("pressed");
      const isDisliked = dislikebtn.classList.contains("pressed");

      try {
        if (isLiked) {
          const res = await fetch("/api/remove-like", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ post_title: title }),
          });

          if (!res.ok) {
            alert("Cannot unlike");
            return;
          }

          btn.classList.remove("pressed");
          updateTextLike(btn);
          console.log("Post Unliked!");
        } else {
          const res = await fetch("/api/addlike", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              post_title: articleData.title,
              post_category: articleData.category,
              post_source: articleData.source_name,
            }),
          });

          if (!res.ok) {
            alert("Cannot like post");
            return;
          }

          if (isDisliked) {
            const res = await fetch("/api/remove-dislike", {
              method: "DELETE",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ post_title: title }),
            });

            if (!res.ok) {
              alert("Cannot remove dislike");
              return;
            }

            dislikebtn.classList.remove("pressed");
            updateTextdisLike(dislikebtn);
            console.log("Dislike Removed!");
          }

          btn.classList.add("pressed");
          updateTextLike(btn);
          alert("Post liked!");
        }
      } catch (err) {
        console.error("Error:", err);
        alert("Cannot add or delete bookmark");
      }
    });
  }

  function updateTextLike(btn) {
    if (btn.classList.contains("pressed")) {
      btn.innerHTML = `
        <span class="material-symbols-outlined me-2"> thumb_up </span>
        Liked
      `;
    } else {
      btn.innerHTML = `
        <span class="material-symbols-outlined me-2"> thumb_up </span>
        Like
      `;
    }
  }

  function updateTextdisLike(dislikeBtn) {
    if (dislikeBtn.classList.contains("pressed")) {
      dislikeBtn.innerHTML = `
        <span class="material-symbols-outlined me-2">
                  thumb_down
                </span>
                Disliked
      `;
    } else {
      dislikeBtn.innerHTML = `
        <span class="material-symbols-outlined me-2">
                  thumb_down
                </span>
                Dislike
      `;
    }
  }
}

async function dislike_post() {
  const postBigContainers = document.querySelector(".title-container");

  const titleElement = postBigContainers.querySelector(".news-title h2");
  const title = titleElement.textContent.trim();

  try {
    const res = await fetch("/api/check-dislikes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ post_title: title }),
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const result = await res.json();
    const dislikedTitles = result.dislikes || [];

    if (!result || !("dislikes" in result)) {
      throw new Error("Invalid response: missing 'dislikes'");
    }

    console.log(dislikedTitles);

    handleLikes(
      postBigContainers,
      ".news-title h2",
      ".dislikebtn",
      dislikedTitles
    );
  } catch (err) {
    console.error("Checking Bookmarks Failed:", err);
  }

  function handleLikes(post, titleSelector, btnSelector, dislikedTitles) {
    const likebtn = post.querySelector(".likebtn");
    if (!likebtn) return;

    const titleElement = post.querySelector(titleSelector);
    const title = titleElement?.textContent.trim();
    if (!title) return;

    const dislikebtn = post.querySelector(btnSelector);
    if (!dislikebtn) return;

    const isExist = dislikedTitles.includes(title);
    dislikebtn.classList.toggle("pressed", isExist);
    updateTextdisLike(dislikebtn);

    dislikebtn.addEventListener("click", async function (e) {
      e.preventDefault();

      const isDisliked = dislikebtn.classList.contains("pressed");
      const isLiked = likebtn.classList.contains("pressed");

      try {
        if (isDisliked) {
          const res = await fetch("/api/remove-dislike", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ post_title: title }),
          });

          if (!res.ok) {
            alert("Cannot remove dislike");
            return;
          }

          dislikebtn.classList.remove("pressed");
          updateTextdisLike(dislikebtn);
          console.log("Dislike Removed!");
        } else {
          const res = await fetch("/api/add-dislike", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              post_title: articleData.title,
              post_category: articleData.category,
              post_source: articleData.source_name,
            }),
          });

          if (!res.ok) {
            alert("Cannot dislike post");
            return;
          }

          if (isLiked) {
            const remove_like = await fetch("/api/remove-like", {
              method: "DELETE",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ post_title: title }),
            });

            if (!remove_like.ok) {
              alert("Cannot remove like");
              return;
            }

            likebtn.classList.remove("pressed");
            updateTextLike(likebtn);
          }

          dislikebtn.classList.add("pressed");
          updateTextdisLike(dislikebtn);
          alert("Post disliked!");
        }
      } catch (err) {
        console.error("Error:", err);
        alert("Something went wrong.");
      }
    });
  }

  function updateTextdisLike(dislikeBtn) {
    if (dislikeBtn.classList.contains("pressed")) {
      dislikeBtn.innerHTML = `
        <span class="material-symbols-outlined me-2">
                  thumb_down
                </span>
                Disliked
      `;
    } else {
      dislikeBtn.innerHTML = `
        <span class="material-symbols-outlined me-2">
                  thumb_down
                </span>
                Dislike
      `;
    }
  }
  function updateTextLike(btn) {
    if (btn.classList.contains("pressed")) {
      btn.innerHTML = `
        <span class="material-symbols-outlined me-2"> thumb_up </span>
        Liked
      `;
    } else {
      btn.innerHTML = `
        <span class="material-symbols-outlined me-2"> thumb_up </span>
        Like
      `;
    }
  }
}

async function send_comment() {
  const comment = document.getElementById("comment").value;

  try {
    const res = await fetch("/api/baca-news/add-comment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        post_title: articleData.title,
        post_category: articleData.category,
        post_source: articleData.source_name,
        post_comments: comment,
      }),
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    location.reload();
    console.log("comment sent");
  } catch (err) {
    console.error("Checking Bookmarks Failed:", err);
  }
}

document.getElementById("commentForm").addEventListener("submit", function (e) {
  e.preventDefault();
  send_comment();
});

async function get_comments(event = null) {
  if (event && typeof event.preventDefault === "function") {
    event.preventDefault();
  }
  try {
    const response = await fetch(`/api/get_comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        post_title: articleData.title,
      }),
    });
    const data = await response.json();

    if (data.error) {
      console.error(data.error);
      return;
    }

    const commentList = data.comments || [];
    console.log("data:", data.comments);
    const commentContainer = document.querySelector(".news-comment-content");

    commentContainer.innerHTML = "";

    commentList.forEach((comment) => {
      if (!comment.user) return;
      const commentElement = document.createElement("div");
      commentElement.classList.add(
        "comment",
        "d-flex",
        "justify-content-start",
        "align-items-start",
        "flex-row",
        "mt-4"
      );

      commentElement.innerHTML = `
          <div class="comment-left me-3" style="width: fit-content">
              <img class="comment-image" src="/${comment.user.profile_photo}" alt="" />
            </div>
            <div
              class="comment-right d-flex justify-content-start align-items-start flex-column pb-3"
              style="width: 90%; border-bottom: solid 1px var(--grey)"
            >
              <div
                class="comment-top-right d-flex justify-content-start align-items-start flex-column"
              >
                <div
                  class="nameanddate d-flex justify-content-start align-items-center flex-row"
                >
                  <h5 class="name-comment">${comment.user.first_name} ${comment.user.last_name}</h5>
                  <small style="font-size: 0.3rem"
                    ><i class="fa-solid fa-circle"></i
                  ></small>
                  <small>2 Hours Ago</small>
                </div>

                <p>
                  ${comment.comment}
                </p>
              </div>
              <div
                class="comment-bottom-right d-flex justify-content-center align-items-center flex-row mt-3"
              >
                <small
                  ><a
                    class="liked d-flex justify-content-center align-items-center flex-row"
                    role="button"
                    data-bs-toggle="button"
                    ><span class="material-symbols-outlined"> thumb_up </span>
                    102 Likes</a
                  ></small
                >
                <small class="circle-comment mx-2" style="color: var(--grey)"
                  ><i class="fa-solid fa-circle"></i
                ></small>
                <small
                  ><a
                    class="disliked d-flex justify-content-center align-items-center flex-row"
                    role="button"
                    data-bs-toggle="button"
                    ><span class="material-symbols-outlined"> thumb_down </span>
                    25 Dislikes</a
                  ></small
                >
                <small class="circle-comment mx-2" style="color: var(--grey)"
                  ><i class="fa-solid fa-circle"></i
                ></small>
                <small
                  ><a
                    class="report d-flex justify-content-center align-items-center flex-row"
                    role="button"
                    data-bs-toggle="modal"
                    data-bs-target="#reportModal"
                    >Report</a
                  ></small
                >
              </div>
            </div>
        `;

      commentContainer.appendChild(commentElement);
    });
  } catch (error) {
    console.error("Error fetching news:", error);
  }
}

document.addEventListener("DOMContentLoaded", async function () {
  bookmark_mid();
  bookmark_post();
  like_post();
  dislike_post();
  get_comments();
});
