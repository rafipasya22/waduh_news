const pathParts = window.location.pathname.split("/");
const cat = pathParts[pathParts.length - 1];

document.addEventListener("DOMContentLoaded", async function () {
  const headlineTitle = document.querySelector(".Headline-top");
  const capCat = cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase();
  headlineTitle.innerHTML = capCat;

  const result = await loadCatNews(cat);
  console.log(result);

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
        const matched = result.find(
          (item) => item.postTitle === title
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

          if (!postData) throw new Error("Article data not found");

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

async function loadCatNews(category) {
  try {
    const res = await fetch(`/api/news/category/${encodeURIComponent(category)}`);
    const data = await res.json();

    if (data.error) {
      console.error(data.error);
      return;
    }

    const articles = data.news;
    if (!articles || articles.length === 0) return;

    const articleDetails = [];

    const bigPost = articles[0];
    const postBigImgContainer = document.querySelector(
      ".top .post-big .container-img"
    );
    const postBigImg = document.querySelector(
      ".popular .top .post-big .container-img img"
    );
    const postBigText = document.querySelector(
      ".popular .top .post-big .post-text-big"
    );

    if (postBigImg)
      postBigImg.src = bigPost.imageUrl || "../static/Assets/img/default.jpeg";
    if (postBigText) {
      postBigText.textContent = bigPost.title;
      postBigText.href = `/api/baca-news/headline/${encodeURIComponent(
        bigPost.category
      )}/${encodeURIComponent(bigPost.title)}`;
      postBigImgContainer.href = `/api/baca-news/headline/${encodeURIComponent(
        bigPost.category
      )}/${encodeURIComponent(bigPost.title)}`;
    }
    const cat = document.querySelector(".popular .top .post-big .news-cat ");
    const catText = document.querySelector(
      ".popular .top .post-big .news-cat p"
    );
    const capCatText =
      bigPost.category.charAt(0).toUpperCase() +
      bigPost.category.slice(1).toLowerCase();

    if (cat) {
      cat.classList.add(capCatText);
      catText.innerHTML = capCatText;
    }

    articleDetails.push({
      postTitle: bigPost.title,
      postCategory: bigPost.category,
    });

    const postMidElements = document.querySelectorAll(".popular-mid .post-mid");
    const midArticles = articles.slice(1, postMidElements.length + 1);

    midArticles.forEach((article, index) => {
      const postMid = postMidElements[index];
      if (!postMid) return;

      const img = postMid.querySelector(".container-img img");
      const redirectimg = postMid.querySelector(".container-img");
      const title = postMid.querySelector(".post-text .title-mid");
      const catP = postMid.querySelector(".news-cat p");

      if (img)
        img.src = article.imageUrl || "../static/Assets/img/default.jpeg";
      if (redirectimg)
        redirectimg.href = `/api/baca-news/headline/${encodeURIComponent(
          article.category
        )}/${encodeURIComponent(article.title)}`;
      if (title) {
        title.textContent = article.title;
        title.parentElement.href = `/api/baca-news/headline/${encodeURIComponent(
          article.category
        )}/${encodeURIComponent(article.title)}`;
      }

      if (catP) {
        const capCat =
          article.category.charAt(0).toUpperCase() +
          article.category.slice(1).toLowerCase();
        catP.textContent = capCat;
        catP.parentElement.classList.add(capCat);
      }

      articleDetails.push({
        postTitle: article.title,
        postCategory: article.category,
      });
    });
    return articleDetails;
  } catch (err) {
    console.error("Error fetching news:", err);
  }
}

document.addEventListener("DOMContentLoaded", async function () {
  
});

document.addEventListener("DOMContentLoaded", function () {
  fetch(`/api/news/category/newest/${encodeURIComponent(cat)}?page_size=10`)
    .then((res) => res.json())
    .then((data) => {
      console.log(data);

      if (data.error) {
        console.error(data.error);
        return;
      }

      const articles = data.news;

      if (articles.length === 0) return;

      const postContainers = document.querySelectorAll(
        ".popular-island .news-container"
      );

      articles.forEach((article, index) => {
        const post = postContainers[index];

        if (post) {
          const postContent = post.querySelector(".news-content");
          const postIndex = post.querySelector(".number h2");

          const cat = postContent.querySelector(".news-cat");
          const catP = postContent.querySelector(".news-cat p");
          const capCatText =
            article.category.charAt(0).toUpperCase() +
            article.category.slice(1).toLowerCase();

          if (cat) {
            cat.classList.add(capCatText);
            catP.innerHTML = capCatText;
          }

          if (postIndex) {
            postIndex.innerHTML = index + 1;
          }

          const PostTitle = postContent.querySelector(".title a h5");
          const TitleContainer = postContent.querySelector(".title a");
          if (PostTitle) {
            PostTitle.textContent = article.title;
            TitleContainer.href = `/api/baca-news/headline/${encodeURIComponent(
              article.category
            )}/${encodeURIComponent(article.title)}`;
          }
        }
      });
    })
    .catch((err) => {
      console.error("Error fetching news:", err);
    });
});

async function fetchAndDisplayNews(cat, page = 1, pageSize = 5, event = null) {
  if (event && typeof event.preventDefault === "function") {
    event.preventDefault();
  }
  try {
    const response = await fetch(
      `/api/news/category/newest/${cat}?page=${page}&page_size=${pageSize}`
    );
    const data = await response.json();

    if (data.error) {
      console.error(data.error);
      return;
    }

    const newsList = data.news;
    const newsContainer = document.querySelector(".container-post");

    newsContainer.innerHTML = "";

    newsList.forEach((news) => {
      const postElement = document.createElement("div");
      const redirect = `/api/baca-news/headline/${encodeURIComponent(
        news.category
      )}/${encodeURIComponent(news.title)}`;
      const catClass =
        news.category.charAt(0).toUpperCase() +
        news.category.slice(1).toLowerCase();
      postElement.classList.add(
        "post-long",
        "d-flex",
        "justify-content-start",
        "align-items-start",
        "flex-row",
        "p-1",
        "mb-3"
      );

      let newsSource = ``;

      if (news.author && news.source_name) {
        newsSource = `<small class="news-long-reporter"><i>Reported By ${news.author} via ${news.source_name}</i></small>`;
      } else if (news.author) {
        newsSource = `<small class="news-long-reporter"><i>Reported By ${news.author}</i></small>`;
      } else if (news.source_name) {
        newsSource = `<small class="news-long-reporter"><i>Reported via ${news.source_name}</i></small>`;
      } else {
        newsSource = `<small class="news-long-reporter"><i>No Source</i></small>`;
      }

      postElement.innerHTML = `
          <div class="post-image">
            <a href="${redirect}" class="container-img">
              <img src="${news.imageUrl}" alt="Image for ${news.title}" />
            </a>
          </div>
          <div class="post-content d-flex justify-content-between align-items-start flex-column">
            <div class="text-area-post-long d-flex justify-content-start align-items-start flex-column">
              <a href="${redirect}" class="post-text-long"><h4>${
        news.title
      }</h4></a>
              <small class="news-long-upload-date">Uploaded ${new Date(
                news.publishedAt
              ).toLocaleDateString()}</small>
              ${newsSource}
              <div class="categories-long news-cat ${catClass} mt-2">
                <div class="cat-text px-1">
                  <p class="px-1">${catClass}</p>
                </div>
              </div>
            </div>
          </div>
        `;

      newsContainer.appendChild(postElement);
    });

    handlePagination(data.total_pages, page);
  } catch (error) {
    console.error("Error fetching news:", error);
  }
}

function handlePagination(totalPages, currentPage) {
  const paginationContainer = document.querySelector(".pageination");
  paginationContainer.innerHTML = "";

  for (let i = 1; i <= totalPages; i++) {
    const pageButton = document.createElement("li");
    pageButton.classList.add("page-item");
    pageButton.innerHTML = `<a class="page-link number ${
      i === currentPage ? "active" : ""
    }" onclick="fetchAndDisplayNews('${cat}', ${i}, 5, event)">${i}</a>`;
    paginationContainer.appendChild(pageButton);
  }
}

fetchAndDisplayNews(cat, 1, 5);
