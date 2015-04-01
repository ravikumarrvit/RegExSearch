function findRegExMatches(regEx) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {command: "search", regexp: regEx}, function(response) {
      // console.log(response.farewell);
    });
  });
}

function getNextMatch() {
  // alert("next");
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {command: "next"}, function(response) {
      // console.log(response.farewell);
    });
  });
}

function getPrevMatch() {
  // alert("next");
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {command: "prev"}, function(response) {
      // console.log(response.farewell);
    });
  });
}
