$("#postTextarea, #replyTextarea").keyup((event) => {
  var textBox = $(event.target);
  var value = textBox.val().trim();
  var isModal = textBox.parents(".modal").length === 1;
  var submitButton = isModal ? $("#submitReplyButton") : $("#submitPost");
  if (value == "") {
    submitButton.prop("disabled", true);
  } else {
    submitButton.prop("disabled", false);
  }
});

$("#submitPost, #submitReplyButton").click((event) => {
  var button = $(event.target);
  var isModal = button.parents(".modal").length === 1;
  var textBox = isModal ? $("#replyTextarea") : $("#postTextarea");
  var value = textBox.val().trim();
  var data = {
    content: value,
  };
  if (isModal) {
    var id = button.data().id;
    data.replyTo = id;
  }
  $.post("/api/posts", data, (postData) => {
    if (postData.replyTo) {
      location.reload();
    }
    var html = createPostHTML(postData);
    $(".postsContainer").prepend(html);
    textBox.val("");
    button.prop("disabled", true);
  });
});

$(document).on("click", ".likeButton", (event) => {
  var button = $(event.target);
  var id = getPostIdFromElement(button);
  if (id === undefined) return;
  $.ajax({
    type: "PUT",
    url: `/api/posts/${id}/like`,
    success: (response) => {
      button.find("span").text(response.likes.length || "");
      if (response.likes.includes(userLoggedIn._id)) {
        button.addClass("active");
      } else {
        button.removeClass("active");
      }
    },
  });
});

$(document).on("click", ".retweetButton", (event) => {
  var button = $(event.target);
  var id = getPostIdFromElement(button);
  if (id === undefined) return;
  $.ajax({
    type: "POST",
    url: `/api/posts/${id}/retweet`,
    success: (response) => {
      button.find("span").text(response.retweetUsers.length || "");
      if (response.retweetUsers.includes(userLoggedIn._id)) {
        button.addClass("active");
      } else {
        button.removeClass("active");
      }
    },
  });
});

$(document).on("click", ".post", (event) => {
  var element = $(event.target);
  var id = getPostIdFromElement(element);
  if (id === undefined) return;
  if (id !== undefined && !element.is("button")) {
    window.location.href = `/posts/${id}`;
  }
});

$(document).on("click", ".FollowButton", (event) => {
  var button = $(event.target);
  var userId = button.data().user;

  $.ajax({
    type: "PUT",
    url: `/api/users/${userId}/follow`,
    success: (data, status, xhr) => {
      console.log(data);
      if (xhr.status == 404) {
        return "User not found";
      }
      var difference = 1;
      if (data.following && data.following.includes(userId)) {
        button.addClass("Following");
        button.text("Following");
      } else {
        button.removeClass("Following");
        button.text("Follow");
        difference = -1;
      }
      var followersLabel = $("#followersValue");
      if (followersLabel.length != 0) {
        followersLabel.text(parseInt(followersLabel.text() + difference));
      }
    },
  });
});

function getPostIdFromElement(element) {
  var isRoot = element.hasClass("post");
  var rootElement = isRoot === true ? element : element.closest(".post");
  if (rootElement === undefined) {
    console.log("Root element does not exist");
  }
  return rootElement?.data().id;
}

function createPostHTML(postData, largeFont = false) {
  var isRetweet = postData.retweetData !== undefined;
  var retweetedBy = isRetweet ? postData.postedBy.userName : null;
  postData = isRetweet ? postData.retweetData : postData;

  const postedBy = postData.postedBy;
  var displayName = postedBy.firstName + " " + postedBy.lastName;
  var timeStamp = timeDifference(new Date(), new Date(postData.createdAt));
  var activeClass = postData.likes.includes(userLoggedIn._id) ? "active" : "";
  var activeClass_tweet = postData.retweetUsers.includes(userLoggedIn._id)
    ? "active"
    : "";

  var retweetText = isRetweet
    ? `<span> <i class="fa-solid fa-retweet"></i>Retweeted By <a href="/profile/${retweetedBy}">@${retweetedBy}</span>`
    : "";

  var replyFlag = "";
  var largeFontClass = largeFont ? "largeFont" : "";
  if (postData.replyTo && postData.replyTo._id) {
    const replyToUserName = postData.replyTo.postedBy.userName;
    replyFlag = `<div class="replyFlag">
    Replying to <a href='/profile/${replyToUserName}'>${replyToUserName}</a>
    </div>`;
  }
  var deleteButton = "";
  if (postData.postedBy._id === userLoggedIn._id) {
    deleteButton = `<button class="deleteButton" data-toggle="modal" data-target="#deleteModal">
                       <i class="fa-solid fa-times"></i>
                    </button>`;
  }
  return `<div class="post ${largeFontClass}" data-id="${postData._id}">
           <div class="postActionContainer">${retweetText}</div>
           <div class="mainContentContainer"> 
              <div class="userImageContainer">
                  <img src=${postedBy.profilePic}>
              </div>
              <div class="postContentContainer">
                <div class="header">
                  <a href="/profile/${
                    postedBy.userName
                  }" class="displayName">${displayName}</a>
                  <span class="username">@${postedBy.userName}</span>
                  <span class="date">${timeStamp}</span>
                  ${deleteButton}
                </div>
                ${replyFlag}
                <div class="postBody">${postData.content}</div>
                <div class="postFooter">
                    <div class="postButtonContainer">
                        <button class="replyButton" data-toggle="modal" data-target="#replyModal">
                            <i class="fa-regular fa-comment"></i>
                        </button>
                    </div>
                    <div class="postButtonContainer green">
                        <button class="retweetButton ${activeClass_tweet}">
                            <i class="fa-solid fa-retweet"></i>
                            <span>${postData.retweetUsers.length || ""}</span>
                        </button>
                    </div>
                    <div class="postButtonContainer red">
                        <button class="likeButton ${activeClass}">
                            <i class="fa-regular fa-heart"></i>
                            <span>${postData.likes.length || ""}</span>
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

function outputPost(results, container) {
  container.html("");

  if (!Array.isArray(results)) {
    results = [results];
  }

  results.forEach((result) => {
    var html = createPostHTML(result);

    container.append(html);
  });

  if (results.length === 0) {
    container.append("<span class='noResults'>Nothing to show </span>");
  }
}

$("#replyModal").on("show.bs.modal", function (event) {
  const button = $(event.relatedTarget);
  const id = getPostIdFromElement(button);
  $("#submitReplyButton").attr("data-id", id);
  $.get(`/api/posts/${id}`, (results) => {
    outputPost(results.postData, $("#originalPostContainer"));
  });
});

$("#deleteModal").on("show.bs.modal", function (event) {
  const button = $(event.relatedTarget);
  const id = getPostIdFromElement(button);
  $("#deletePostButton").attr("data-id", id);
});

$("#deletePostButton").click((event) => {
  const id = $(event.target).data().id;
  $.ajax({
    type: "DELETE",
    url: `/api/posts/${id}`,
    success: () => {
      location.reload();
    },
  });
});

$("#replyModal").on("hidden.bs.modal", () => {
  $("#originalPostContainer").html("");
});

function outputPostWithReplies(results, container) {
  container.html("");

  if (results.replyTo !== undefined) {
    var html = createPostHTML(results.replyTo);
    container.append(html);
  }

  var mainPostHTML = createPostHTML(results.postData, true);
  container.append(mainPostHTML);

  results.replies.forEach((result) => {
    var html = createPostHTML(result);
    container.append(html);
  });
}
