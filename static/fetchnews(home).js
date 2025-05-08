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

    return bigPost.title; // misalnya kamu mau return title-nya
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

    const postContainers = document.querySelectorAll(".post-big");
    console.log("Jumlah post:", postContainers.length);
    const titleList = [];
  
    postContainers.forEach(post => {
      const titleElement = post.querySelector(".post-text-big");
      if (titleElement) {
        const title = titleElement.textContent.trim();
        if (title) {
          titleList.push(title);
        }
      }
    });
  
    console.log("Daftar judul:", titleList);
  
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
  
      postContainers.forEach(post => {
        const btn = post.querySelector(".bookmarkbtn");
        const titleElement = post.querySelector(".post-text-big");
        const title = titleElement?.textContent.trim();
  
        if (!btn || !title) return;
  
        const isBookmarked = bookmarkedTitles.includes(title);
        if (isBookmarked) {
          btn.classList.add("bookmarked");
        } else {
          btn.classList.remove("bookmarked");
        }
  
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
  
            if (newStatus) {
              btn.classList.add("bookmarked");
            } else {
              btn.classList.remove("bookmarked");
            }
  
            updateText(btn);
            alert(newStatus ? "Post Bookmarked!" : "Bookmark deleted!");
          } catch (err) {
            console.error("Error:", err);
            alert("Cannot add or delete bookmark");
          }
        });
      });
  
    } catch (err) {
      console.error("Checking Bookmarks Failed:", err);
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
  });
