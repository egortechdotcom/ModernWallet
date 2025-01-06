export const setChromeStorage = (key, value, callback) => {
    // eslint-disable-next-line no-undef
    chrome.storage.local.set({ [key]: value }, () => {
        if (callback) {
            callback();
        }
    });
};

export const getChromeStorage = (key, callback) => {
    // eslint-disable-next-line no-undef
    chrome.storage.local.get(key, (result) => {
        const data = result[key];
        if (callback) {
            callback(data);
        }
    });
};


export const isStorageSet = (variableName) => {
    return new Promise((resolve, reject) => {
        // eslint-disable-next-line no-undef
        chrome.storage.local.get([variableName], function (result) {
            // eslint-disable-next-line no-undef
            if (chrome.runtime.lastError) {
                // eslint-disable-next-line no-undef
                reject(chrome.runtime.lastError);
            } else {
                if (result[variableName] !== undefined) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            }
        });
    });
};


export const removeStorageKey = (keys) => {
    return new Promise((resolve, reject) => {
        // eslint-disable-next-line no-undef
        chrome.storage.local.remove(keys, () => {
            // eslint-disable-next-line no-undef
            let error = chrome.runtime.lastError;
            if (error) {
                console.error(error);
                reject(false)
            }
            resolve(true)
        })
    })
}
