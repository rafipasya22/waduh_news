async function loadHeadlineNews() {
  try {
    const res = await fetch("/api/ambil_news");
    const data = await res.json();

    if (data.error) {
      console.error(data.error);
      return;
    }

    const articles = data.news;
    if (articles.length === 0) return;

    const bigPost = articles[0];

    const postBigContainer = document.querySelector(".todays-headline .top .post-big");
    const postBigImgContainer = document.querySelector(".top .post-big .container-img");
    const postBigImg = postBigContainer.querySelector(".container-img img");
    const postBigText = postBigContainer.querySelector(".post-text-big");
    const cat = postBigContainer.querySelector(".news-cat");
    const catText = postBigContainer.querySelector(".news-cat p");
    const capCatText = bigPost.category.charAt(0).toUpperCase() + bigPost.category.slice(1).toLowerCase();

    if (cat) {
      cat.classList.add(capCatText);
      catText.innerHTML = capCatText;
    }

    if (postBigImg) postBigImg.src = bigPost.imageUrl || "../static/Assets/img/default.jpg";
    if (postBigText) {
      postBigText.innerHTML = bigPost.title;
      postBigText.href = `/api/baca-news/headline/${encodeURIComponent(bigPost.category)}/${encodeURIComponent(bigPost.title)}`;
      postBigImgContainer.href = `/api/baca-news/headline/${encodeURIComponent(bigPost.category)}/${encodeURIComponent(bigPost.title)}`;
    }

    return bigPost.title;
  } catch (err) {
    console.error("Error fetching news:", err);
  }
}

/*
document.addEventListener("DOMContentLoaded", function () {
    fetch("/api/ambil_news/sports")
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
  
        if (data.error) {
          console.error(data.error);
          return;
        }
  
        const articles = data.news;
  
        if (articles.length === 0) return;
  
        const postContainers = document.querySelectorAll(".sports-container .post-mid");
  
        articles.forEach((article, index) => {
          const postMid = postContainers[index];
          
          if (postMid) {
            const postContent = postMid.querySelector(".post-content");
  
            const imgElement = postContent.querySelector(".container-img img");
            if (imgElement) {
              imgElement.src = article.imageUrl || "../static/Assets/img/default.jpg";
            }
  
            const cat = postContent.querySelector(".post-text .news-cat");
            const catP = postContent.querySelector(".post-text .news-cat p");
            const capCatText = article.category.charAt(0).toUpperCase() + article.category.slice(1).toLowerCase();
  
            if(cat) {
              cat.classList.add(capCatText);
              catP.innerHTML = capCatText;
            }
  
            const PostTitle = postContent.querySelector(".post-text .title-mid");
            const TitleContainer = postContent.querySelector(".post-text");
            const redirectimg = postContent.querySelector(".container-img")
            if (PostTitle) {
              PostTitle.textContent = article.title;
              TitleContainer.href = `/api/baca-news/headline/${encodeURIComponent(article.category)}/${encodeURIComponent(article.title)}`;
              redirectimg.href = `/api/baca-news/headline/${encodeURIComponent(article.category)}/${encodeURIComponent(article.title)}`;
            }
          }
        });
      })
      .catch((err) => {
        console.error("Error fetching news:", err);
      });
  });
*/
async function loadPopularNews() {
  try {
    const res = await fetch("/api/ambil_news/popular");
    const data = await res.json();

    if (data.error) {
      console.error(data.error);
      return;
    }

    const articles = data.news;
    if (!articles || articles.length === 0) return;

    const bigPost = articles[0];
    const postBigContainer = document.querySelector(".popular .top .post-big");
    const postBigImgContainer = postBigContainer.querySelector(".container-img");
    const postBigImg = postBigContainer.querySelector(".container-img img");
    const postBigText = postBigContainer.querySelector(".post-text-big");

    if (postBigImg)
      postBigImg.src = bigPost.imageUrl || "../static/Assets/img/default.jpeg";
    if (postBigText) {
      postBigText.textContent = bigPost.title;
      postBigText.href = `/api/baca-news/${encodeURIComponent(bigPost.category)}/${encodeURIComponent(bigPost.title)}`;
      postBigImgContainer.href = `/api/baca-news/${encodeURIComponent(bigPost.category)}/${encodeURIComponent(bigPost.title)}`;
    }

    const cat = document.querySelector(".popular .top .post-big .news-cat ");
    const catText = document.querySelector(".popular .top .post-big .news-cat p");
    const capCatText = bigPost.category.charAt(0).toUpperCase() + bigPost.category.slice(1).toLowerCase();

    if (cat) {
      cat.classList.add(capCatText);
      catText.innerHTML = capCatText;
    }

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
        redirectimg.href = `/api/baca-news/${encodeURIComponent(article.category)}/${encodeURIComponent(article.title)}`;
      if (title) {
        title.textContent = article.title;
        title.parentElement.href = `/api/baca-news/${encodeURIComponent(article.category)}/${encodeURIComponent(article.title)}`;
      }

      if (catP) {
        const capCat = article.category.charAt(0).toUpperCase() + article.category.slice(1).toLowerCase();
        catP.textContent = capCat;
        catP.parentElement.classList.add(capCat);
      }
    });
  } catch (err) {
    console.error("Error fetching news:", err);
  }
}


document.addEventListener("DOMContentLoaded", async function () {
  await loadHeadlineNews();
  await loadPopularNews();

  const postBigContainers = document.querySelectorAll(".post-big");
  const postMidContainers = document.querySelectorAll(".post-mid");

  const titleList = [];

  postBigContainers.forEach(post => {
    const titleElement = post.querySelector(".post-text-big");
    if (titleElement) {
      const title = titleElement.textContent.trim();
      if (title) {
        titleList.push(title);
      }
    }
  });

  postMidContainers.forEach(post => {
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

    postBigContainers.forEach(post => {
      handleBookmark(post, ".post-text-big", ".bookmarkbtn", bookmarkedTitles, false);
    });

    postMidContainers.forEach(post => {
      handleBookmark(post, ".title-mid", ".bookmark-icon", bookmarkedTitles, true);
    });

  } catch (err) {
    console.error("Checking Bookmarks Failed:", err);
  }

  function handleBookmark(post, titleSelector, btnSelector, bookmarkedTitles, isCheckbox) {
    const titleElement = post.querySelector(titleSelector);
    const title = titleElement?.textContent.trim();
    if (!title) return;

    if (isCheckbox) {
      const label = post.querySelector(btnSelector);
      const checkbox = label?.querySelector("input[type='checkbox']");
      const icon = label?.querySelector("span.material-symbols-outlined");
      const bookmarkText = post.querySelector(".post-analytics-mid .bookmark small")
      if (!label || !checkbox || !icon || !bookmarkText) return;

      const isBookmarked = bookmarkedTitles.includes(title);
      checkbox.checked = isBookmarked;
      updateIcon(icon, isBookmarked, bookmarkText);

      checkbox.addEventListener("change", async function () {
        const checked = checkbox.checked;
        try {
          const res = await fetch(checked ? "/api/bookmark" : "/api/remove-bookmark", {
            method: checked ? "POST" : "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ Title: title }),
          });

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

    } else {
      const btn = post.querySelector(btnSelector);
      if (!btn) return;

      const isBookmarked = bookmarkedTitles.includes(title);
      btn.classList.toggle("bookmarked", isBookmarked);
      updateText(btn);

      btn.addEventListener("click", async function (e) {
        e.preventDefault();
        const newStatus = btn.classList.contains("bookmarked");

        try {
          const res = await fetch(newStatus ? "/api/bookmark" : "/api/remove-bookmark", {
            method: newStatus ? "POST" : "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ Title: title }),
          });

          if (!res.ok) {
            alert("Cannot add or delete bookmark");
            return;
          }

          btn.classList.toggle("bookmarked", newStatus);
          updateText(btn);
          alert(newStatus ? "Post Bookmarked!" : "Bookmark deleted!");
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

