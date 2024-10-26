// Define the popup dimensions
const popupWidth = 400; // Adjust as needed
const popupHeight = 600; // Adjust as needed

// Create a listener for when the extension icon is clicked
chrome.action.onClicked.addListener((tab) => {
  // Define the screen width
  const screenWidth = window.screen.width;

  // Calculate the left position to ensure the popup does not overlap
  const leftPosition = screenWidth - popupWidth - 20; // Leave a small margin (20px) from the right edge

  // Create the popup window
  chrome.windows.create({
    url: "index.html", // URL of the popup
    type: "popup", // Type of window
    width: popupWidth, // Width of the popup
    height: popupHeight, // Height of the popup
    left: leftPosition, // Position the popup on the right
    top: 0, // Position the popup at the top
  });
});
