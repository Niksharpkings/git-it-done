var repoNameEl = document.querySelector("#repo-name");
var issueContainerEl = document.querySelector("#issues-container");
var limitWarningEl = document.querySelector("#limit-warning");

var getRepoName = function() {
  // grab repo name from url query string
  var params = new URLSearchParams(document.location.search);
  var repoName = params.get("repo");

  if (repoName) {
    // display repo name on the page
    repoNameEl.textContent = repoName;

    getRepoIssues(repoName);
  } else {
    // if no repo was given, redirect to the homepage
    document.location.replace("./index.html");
  }
};

var getRepoIssues = function(repo) {
  // format the github api url
  var apiUrl = "https://api.github.com/repos/" + encodeURI(repo) + "/issues?direction=asc";

  // make a get request to url
  fetch(apiUrl).then(function(response) {
    // request was successful
    if (response.ok) {
      response.json().then(function(data) {
        displayIssues(data);

        // check if api has paginated issues
        if (response.headers.get("Link")) {
          displayWarning(repo);
        }
      });
    } else if (response.status === 403) {
      issueContainerEl.textContent = "GitHub API rate limit reached. Please try again later.";
    } else {
      // if not successful, redirect to homepage
      document.location.replace("./index.html");
    }
  }).catch(function() {
    issueContainerEl.textContent = "Unable to load issues right now. Check your connection and try again.";
  });
};

var displayIssues = function(issues) {
  if (issues.length === 0) {
    issueContainerEl.textContent = "This repo has no open issues!";
    return;
  }

  // loop over given issues
  for (var i = 0; i < issues.length; i++) {
    // create a link element to take users to the issue on github
    var issueEl = document.createElement("a");
    issueEl.className = "list-item flex-row justify-space-between align-center";
    issueEl.setAttribute("href", issues[i].html_url);
    issueEl.setAttribute("target", "_blank");
    issueEl.setAttribute("rel", "noopener noreferrer");

    // create span to hold issue title
    var titleEl = document.createElement("span");
    titleEl.textContent = issues[i].title;

    // append to container
    issueEl.appendChild(titleEl);

    // create a type element
    var typeEl = document.createElement("span");

    // check if issue is an actual issue or a pull request
    if (issues[i].pull_request) {
      typeEl.textContent = "(Pull request)";
    } else {
      typeEl.textContent = "(Issue)";
    }

    // append to container
    issueEl.appendChild(typeEl);

    // append to the dom
    issueContainerEl.appendChild(issueEl);
  }
};

var displayWarning = function(repo) {
  // add text to warning container
  limitWarningEl.textContent = "To see more than 30 issues, visit ";

  // create link element
  var linkEl = document.createElement("a");
  linkEl.textContent = "GitHub.com";
  linkEl.setAttribute("href", "https://github.com/" + encodeURI(repo) + "/issues");
  linkEl.setAttribute("target", "_blank");
  linkEl.setAttribute("rel", "noopener noreferrer");

  // append to warning container
  limitWarningEl.appendChild(linkEl);
};

getRepoName();
