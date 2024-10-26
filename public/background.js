const popupWidth = 400;
const popupHeight = 600;

chrome.action.onClicked.addListener((tab) => {
  const screenWidth = window.screen.width;

  const leftPosition = screenWidth - popupWidth - 20;

  // Creating the popup window
  chrome.windows.create({
    url: "index.html",
    type: "popup",
    width: popupWidth,
    height: popupHeight,
    left: leftPosition,
    top: 0,
  });
});
