const checkDate = () => {
  chrome.storage.sync.get('history', ({ history = []}) => {
    const now = new Date();
    const today = `${now.getDate()}/${now.getMonth()}/${now.getFullYear()}`;
    const isCheckedIn = history.includes(today);
    if (isCheckedIn) {
      chrome.action.setBadgeText({ text: '1' });
      chrome.action.setBadgeBackgroundColor({ color: '#3CCF4E' });
    } else {
      chrome.action.setBadgeText({ text: '0' });
      chrome.action.setBadgeBackgroundColor({ color: '#B93160' });
    }
  })
};

chrome.runtime.onStartup.addListener(checkDate);
chrome.runtime.onInstalled.addListener(checkDate);
chrome.storage.onChanged.addListener(checkDate);
