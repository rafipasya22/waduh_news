document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const query = params.get("query");
    const cat = params.get("category");
    if (query && cat) {
      console.log(encodeURIComponent(query));
      console.log(encodeURIComponent(cat));
      fetchAndDisplayNews(query, cat);
    }
  });

async function fetchAndDisplayNews(
    query,
    category,
    page = 1,
    pageSize = 5,
    event = null
  ) {
    if (event && typeof event.preventDefault === "function") {
        event.preventDefault();
      }
      try {
        const response = await fetch(
          `/api/news/search/${encodeURIComponent(query)}/${encodeURIComponent(category)}?page=${page}&page_size=${pageSize}`
        );
        const data = await response.json();
        console.log(data);
    
        if (data.error) {
          console.error(data.error);
          return;
        }
    
        const newsList = data.news;
        const newsContainer = document.querySelector(".container-post");
    
        const searchResuld = document.querySelector(".search-rslt");
    
        searchResuld.innerHTML = `Search result: "${query}" found in ${data.total_items} posts`;
    
        newsContainer.innerHTML = "";
    
        newsList.forEach((news) => {
          const postElement = document.createElement("div");
          const redirect = `/api/search/more-categories/baca-news/${encodeURIComponent(news.category)}/${encodeURIComponent(news.title)}`;
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
    
        handlePagination(query, data.total_pages, page);
      } catch (error) {
        console.error("Error fetching news:", error);
      }
  }

  function handlePagination(query, totalPages, currentPage) {
    const paginationContainer = document.querySelector(".pageination");
    paginationContainer.innerHTML = "";
  
    for (let i = 1; i <= totalPages; i++) {
      const pageButton = document.createElement("li");
      pageButton.classList.add("page-item");
      pageButton.innerHTML = `<a class="page-link number ${
        i === currentPage ? "active" : ""
      }" onclick="fetchAndDisplayNews('${query}', ${i}, 5, event)">${i}</a>`;
      paginationContainer.appendChild(pageButton);
    }
  }