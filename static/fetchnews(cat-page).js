const pathParts = window.location.pathname.split("/");
const cat = pathParts[pathParts.length - 1];

document.addEventListener("DOMContentLoaded", function () {
  const headlineTitle = document.querySelector(".Headline-top");
  const capCat = cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase();
  headlineTitle.innerHTML = capCat;
});

document.addEventListener("DOMContentLoaded", function () {
  fetch(`/api/news/category/${encodeURIComponent(cat)}`)
    .then((res) => res.json())
    .then((data) => {
      if (data.error) {
        console.error(data.error);
        return;
      }

      const articles = data.news;
      if (!articles || articles.length === 0) return;

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
        postBigImg.src =
          bigPost.imageUrl || "../static/Assets/img/default.jpeg";
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

      const postMidElements = document.querySelectorAll(
        ".popular-mid .post-mid"
      );
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
      });
    })
    .catch((err) => {
      console.error("Error fetching news:", err);
    });
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
