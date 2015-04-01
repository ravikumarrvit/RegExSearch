// Original JavaScript code by Chirp Internet: www.chirp.com.au
// Please acknowledge use of this code by including this header.

function Hilitor(id, tag)
{

  var targetNode = document.getElementById(id) || document.body;
  console.log(targetNode);
  var hiliteTag = tag || "EM";
  var skipTags = new RegExp("^(?:" + hiliteTag + "MARK|NOSCRIPT|STYLE|SCRIPT)$");
  var colors = ["#ff6", "#a0ffff", "#9f9", "#f99", "#f6f"];
  var wordColor = [];
  var colorIdx = 0;
  var currentMatch = 0;
  var matchRegex = "";
  var openLeft = false;
  var openRight = false;

  this.setMatchType = function(type)
  {
    switch(type)
    {
      case "left":
        this.openLeft = false;
        this.openRight = true;
        break;
      case "right":
        this.openLeft = true;
        this.openRight = false;
        break;
      case "open":
        this.openLeft = this.openRight = true;
        break;
      default:
        this.openLeft = this.openRight = false;
    }
  };

  this.setRegex = function(input)
  {
    // input = input.replace(/^[^\w]+|[^\w]+$/g, "").replace(/[^\w'-]+/g, "|");
    var re = input;
    if(!this.openLeft) re = "\\b" + re;
    if(!this.openRight) re = re + "\\b";
    matchRegex = new RegExp(re, "igm");
  };

  this.getRegex = function()
  {
    var retval = matchRegex.toString();
    retval = retval.replace(/(^\/(\\b)?|\(|\)|(\\b)?\/i$)/g, "");
    retval = retval.replace(/\|/g, " ");
    return retval;
  };

  // recursively apply word highlighting
  this.hiliteWords = function(node)
  {
    if(node === undefined || !node) return;
    if(!matchRegex) return;
    if(skipTags.test(node.nodeName)) return;

    var disp = node.style.display;
    if (node.nodeType != Node.TEXT_NODE &&
        (disp == 'none' || disp == 'hidden')) {
        return;
    }

    if(node.hasChildNodes()) {
      for(var i=0; i < node.childNodes.length; i++)
        this.hiliteWords(node.childNodes[i]);
    }
    if(node.nodeType == 3) { // NODE_TEXT
      if((nv = node.nodeValue) && (regs = matchRegex.exec(nv))) {
        // if(!wordColor[regs[0].toLowerCase()]) {
        //   wordColor[regs[0].toLowerCase()] = colors[colorIdx++ % colors.length];
        // }
        var match = document.createElement(hiliteTag);
        match.appendChild(document.createTextNode(regs[0]));
        // match.style.backgroundColor = wordColor[regs[0].toLowerCase()];
        match.style.backgroundColor = "yellow"
        match.style.fontStyle = "inherit";
        match.style.color = "#000";

        var after = node.splitText(regs.index);
        after.nodeValue = after.nodeValue.substring(regs[0].length);
        node.parentNode.insertBefore(match, after);
      }
    };
  };

  // remove highlighting
  this.remove = function()
  {
    var arr = document.getElementsByTagName(hiliteTag);
    while(arr.length && (el = arr[0])) {
      var parent = el.parentNode;
      parent.replaceChild(el.firstChild, el);
      parent.normalize();
    }
  };

  // start highlighting at target node
  this.apply = function(input)
  {
    currentMatch = 0;
    this.remove();
    if(input === undefined || !input) return;
    this.setMatchType("open");
    this.setRegex(input);
    this.hiliteWords(targetNode);
  };

  this.hightLightNextMatch = function() {
    // alert("hi");
    var arr = document.getElementsByTagName(hiliteTag);
    // alert("Hi: " + currentMatch);
    if(arr.length == 0)
      return;
    if(currentMatch != 0) {
      var prevEl = arr[currentMatch - 1];
      prevEl.style.backgroundColor = "yellow";
    }
    if (currentMatch == arr.length) {
      currentMatch = 0;
    }
    var currEl = arr[currentMatch];
    console.log(currEl.parentNode);
    currEl.style.backgroundColor = "orange";
    currentMatch = currentMatch + 1;
  }

  this.hightLightPrevMatch = function() {
    // alert("hi");
    var arr = document.getElementsByTagName(hiliteTag);
    // alert("Hi: " + currentMatch);
    if(arr.length == 0)
      return;
    if(currentMatch != 0) {
      var prevEl = arr[currentMatch - 1];
      prevEl.style.backgroundColor = "yellow";
    }
    if (currentMatch == arr.length) {
      currentMatch = 0;
    }
    var currEl = arr[currentMatch];
    console.log(currEl.parentNode);
    currEl.style.backgroundColor = "orange";
    currentMatch = currentMatch + 1;
  }

}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  // alert(request.data);
  if (request.action == "next") {
    // alert("next1");
    myHilitor.hightLightNextMatch();
  } else {
    myHilitor.apply(request.data);
  }
});

myHilitor = new Hilitor();
