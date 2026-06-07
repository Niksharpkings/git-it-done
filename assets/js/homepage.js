var userFormEl = document.querySelector("#user-form");
var nameInputEl = document.querySelector("#username");
var repoContainerEl = document.querySelector("#repos-container");
var repoSearchTerm = document.querySelector("#repo-search-term");
var languageButtonsEl = document.querySelector("#language-buttons");

var formSubmitHandler = function(event) {
  // prevent page from refreshing
  event.preventDefault();

  // get value from input element
  var username = nameInputEl.value.trim();

  if (username) {
    getUserRepos(username);

    // clear old content
    repoContainerEl.textContent = "";
    nameInputEl.value = "";
  } else {
    alert("Please enter a GitHub username");
  }
};

var getUserRepos = function(user) {
  // format the github api url
  var apiUrl = "https://api.github.com/users/" + encodeURIComponent(user) + "/repos";

  // make a get request to url
  fetch(apiUrl)
    .then(function(response) {
      // request was successful
      if (response.ok) {
        response.json().then(function(data) {
          displayRepos(data, user);
        });
      } else if (response.status === 403) {
        repoContainerEl.textContent = "GitHub API rate limit reached. Please try again later.";
      } else {
        alert("Error: " + response.statusText);
      }
    })
    .catch(function() {
      alert("Unable to connect to GitHub");
    });
};

var displayRepos = function(repos, searchTerm) {
  // check if api returned any repos
  if (repos.length === 0) {
    repoContainerEl.textContent = "No repositories found.";
    return;
  }

  repoSearchTerm.textContent = searchTerm;

  // loop over repos
  for (var i = 0; i < repos.length; i++) {
    // format repo name
    var repoName = repos[i].owner.login + "/" + repos[i].name;

    // create a link for each repo
    var repoEl = document.createElement("a");
    repoEl.className = "list-item flex-row justify-space-between align-center";
    repoEl.setAttribute("href", "./single-repo.html?repo=" + encodeURIComponent(repoName));

    // create a span element to hold repository name
    var titleEl = document.createElement("span");
    titleEl.textContent = repoName;

    // append to container
    repoEl.appendChild(titleEl);

    // create a status element
    var statusEl = document.createElement("span");
    statusEl.className = "flex-row align-center";

    // check if current repo has issues or not
    if (repos[i].open_issues_count > 0) {
      var issueIconEl = document.createElement("span");
      issueIconEl.className = "status-icon icon-danger";
      issueIconEl.setAttribute("aria-hidden", "true");
      issueIconEl.textContent = "X";
      statusEl.appendChild(issueIconEl);
      statusEl.appendChild(document.createTextNode(repos[i].open_issues_count + " issue(s)"));
    } else {
      var cleanIconEl = document.createElement("span");
      cleanIconEl.className = "status-icon icon-success";
      cleanIconEl.setAttribute("aria-hidden", "true");
      cleanIconEl.textContent = "OK";
      statusEl.appendChild(cleanIconEl);
    }

    // append to container
    repoEl.appendChild(statusEl);

    // append container to the dom
    repoContainerEl.appendChild(repoEl);
  }
};

var getFeaturedRepos = function(language) {
  var apiURL = "https://api.github.com/search/repositories?q=" + encodeURIComponent(language) + "+is:featured&sort=help-wanted-issues";

  fetch(apiURL)
    .then(function(response) {
      if (response.ok) {
        response.json().then(function(data) {
          displayRepos(data.items, language);
        });
      } else if (response.status === 403) {
        repoContainerEl.textContent = "GitHub API rate limit reached. Please try again later.";
      } else {
        alert("Error: Unable to load featured repositories");
      }
    })
    .catch(function() {
      alert("Unable to connect to GitHub");
    });
};

var buttonClickHandler = function(event) {
  // get the language attribute from the clicked element
  var language = event.target.getAttribute("data-language");

  if (language) {
    getFeaturedRepos(language);

    // clear old content
    repoContainerEl.textContent = "";
  }
};
    

// add event listeners to forms
userFormEl.addEventListener("submit", formSubmitHandler);
languageButtonsEl.addEventListener("click", buttonClickHandler);
