// download-handler.js

/**
 * Opens two new tabs: one for a predefined ad link and another for the specified download URL.
 * This function is intended to be called from an onclick attribute in an HTML element.
 * @param {string} downloadUrl - The URL of the actual file to be downloaded.
 */
function openAdAndDownload(downloadUrl) {
    // Open the predefined ad link in a new tab.
    window.open('https://otieu.com/4/9407094', '_blank');
    
    // Open the actual game download link in another new tab.
    // It's important that this URL is correctly passed to the function.
    if (downloadUrl) {
        window.open(downloadUrl, '_blank');
    } else {
        console.error('Download URL was not provided to openAdAndDownload function.');
    }
}
