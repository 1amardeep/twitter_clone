$(document).ready(() => {
  $.get("/api/posts", (results) => {
    outputPost(results, $(".postsContainer"));
  });
});

function outputPost(results, container) {
  container.html("");
  results.forEach((result) => {
    var html = createPostHTML(result);
    container.append(html);
  });

  if (results.length === 0) {
    container.append("<span class='noResults'>Nothing to show </span>");
  }
}
