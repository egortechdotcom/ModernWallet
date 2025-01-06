// eslint-disable-next-line no-undef
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete') {
        // eslint-disable-next-line no-undef
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ['narINUProvider.js']
        });
    }
});
