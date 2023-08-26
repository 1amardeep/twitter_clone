$(document).ready(() => {
  if (selectedTab == "followers") {
    loadFollowers();
  } else {
    loadFollowings();
  }
});

function loadFollowers() {
  $.get(`/api/users/${profileUserId}/followers`, (results) => {
    outputUsers(results.followers, $(".followerAndFollowingResultsContainer"));
  });
}

function loadFollowings() {
  $.get(`/api/users/${profileUserId}/following`, (results) => {
    outputUsers(results.following, $(".followerAndFollowingResultsContainer"));
  });
}

function outputUsers(results, container) {
  container.html("");

  results.forEach((result) => {
    var html = createUserHtml(result, true);
    container.append(html);
  });

  if (results.length === 0) {
    container.append("<span class='noResults'>No results found </span>");
  }
}

function createUserHtml(userData, showFollowButton) {
  var name = userData.firstName + " " + userData.lastName;

  var isFollowing =
    userLoggedIn.following && userLoggedIn.following.includes(userData._id);

  var text = isFollowing ? "Following" : "Follow";
  var isFollowingClass = isFollowing
    ? "FollowButton Following"
    : "FollowButton";

  var followButton = "";
  if (showFollowButton && userLoggedIn._id != userData._id) {
    followButton = `<div class='followButtonContainer'>
                      <button class='${isFollowingClass}' data-user='${userData._id}'> ${text} </button>
                    </div>`;
  }
  return `<div class='user'> 
            <div class='userImageContainer'>
              <img src='${userData.profilePic}' />
            </div>
            <div class='userDetailsContainer'>
              <div class='header'>
                <a href='/profile/${userData.userName}'> ${name}</a>
                <span class='username'>${userData.userName}</span>
              </div>
            </div>
          ${followButton}
          </div>`;
}
