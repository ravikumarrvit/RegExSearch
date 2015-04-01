/* Once the search text is ready... */
window.addEventListener('keyup', function(e) {
  var bgp = chrome.extension.getBackgroundPage();
  searchText = document.getElementById("input-text").value;
  if(e.keyCode == 13) {
    bgp.getNextMatch();
  } else {
    // alert(bgp);
    // alert("Enter not pressed");
    bgp.findRegExMatches(searchText);
  }
});

window.addEventListener('click', function(e) {
  var bgp = chrome.extension.getBackgroundPage();
  if(e.target.name == "next") {
    // alert("Next pressed");
    bgp.getNextMatch();
  } else if (e.target.name == "prev") {
    // alert("Prev pressed");
    bgp.getPrevMatch();
  }
});
