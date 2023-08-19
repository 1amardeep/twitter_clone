$("#postTextarea").keyup((event) => {
  var textBox = $(event.target);
  var value = textBox.val().trim();
  console.log(value);
  var submitButton = $("#submitPost");
  if (value == "") {
    submitButton.prop("disabled", true);
  } else {
    submitButton.prop("disabled", false);
  }
});

$("#submitPost").click((event) => {
  var button = $(event.target);
  var textBox = $("#postTextarea");
  var value = textBox.val().trim();
  var data = {
    content: value,
  };
  $.post("/api/posts", data, (postData) => {
    var html = createPostHTML(postData);
    $(".postsContainer").prepend(html);
    textBox.val("");
    button.prop("disabled", true);
  });
});

function createPostHTML(postData) {
  const postedBy = postData.postedBy;
  var displayName = postedBy.firstName + " " + postedBy.lastName;
  var timeStamp = timeDifference(new Date(), new Date(postData.createdAt));

  return `<div class="post">
           <div class="mainContentContainer"> 
              <div class="userImageContainer">
                  <img src=${postedBy.profilePic}>
              </div>
              <div class="postContentContainer">
                <div class="header">
                  <a href="/profile/${postedBy.userName}" class="displayName">${displayName}</a>
                  <span class="username">@${postedBy.userName}</span>
                  <span class="date">${timeStamp}</span>
                </div>
                <div class="postBody">${postData.content}</div>
                <div class="postFooter">
                    <div class="postButtonContainer">
                        <button>
                            <i class="fa-regular fa-comment"></i>
                        </button>
                    </div>
                    <div class="postButtonContainer">
                        <button>
                            <i class="fa-solid fa-retweet"></i>
                        </button>
                    </div>
                    <div class="postButtonContainer">
                        <button>
                            <i class="fa-regular fa-heart"></i>
                        </button>
                    </div>
                </div>
              </div>
           </div>
  </div>`;
}

function timeDifference(current, previous) {
  var msPerMinute = 60 * 1000;
  var msPerHour = msPerMinute * 60;
  var msPerDay = msPerHour * 24;
  var msPerMonth = msPerDay * 30;
  var msPerYear = msPerDay * 365;

  var elapsed = current - previous;

  if (elapsed < msPerMinute) {
    if (elapsed / 1000 < 30) {
      return "Just now";
    }
    return Math.round(elapsed / 1000) + " seconds ago";
  } else if (elapsed < msPerHour) {
    return Math.round(elapsed / msPerMinute) + " minutes ago";
  } else if (elapsed < msPerDay) {
    return Math.round(elapsed / msPerHour) + " hours ago";
  } else if (elapsed < msPerMonth) {
    return Math.round(elapsed / msPerDay) + " days ago";
  } else if (elapsed < msPerYear) {
    return Math.round(elapsed / msPerMonth) + " months ago";
  } else {
    return Math.round(elapsed / msPerYear) + " years ago";
  }
}
