const url = (name, id) => `https://docs.google.com/forms/d/e/1FAIpQLSexbLEee1QP-cz-vkeUyo4OHckopJZ2cz0beZYoWZizrTwpCA/viewform?entry.191404070=${name}&entry.624194211=${id}`;

const buttonCheckin = document.getElementById('checkin');
const inputName = document.getElementById('name');
const inputId = document.getElementById('id');
const helperSpan = document.getElementById('noti-checked');

const onChangeField = (event) => {
    chrome.storage.sync.set({
        [event.target.id]: event.target.value,
    });
}

inputName.addEventListener("change", onChangeField);
inputId.addEventListener("change", onChangeField);

buttonCheckin.addEventListener("click", async (event) => {
    const propertiesTab = {
        url: url(inputName.value, inputId.value),
        active: false,
    }
    const { id: newTabId } = await chrome.tabs.create(propertiesTab);
    const closeTab = setInterval(async () => {
        const { url: currentUrl, status} = await chrome.tabs.get(newTabId);
        const isFormResponse = currentUrl.split('/').reverse()[0] === 'formResponse';
        if (isFormResponse && status === 'complete') {
            // save date to localStorage
            chrome.storage.sync.get('history', function({ history }) {
                const now = new Date();
                const [month, day, year] = [now.getMonth(), now.getDate(), now.getFullYear()];
                const newHistory = history || [];
                newHistory.push(`${day}/${month}/${year}`);
                chrome.storage.sync.set({
                    history: newHistory
                })
            })
            await chrome.tabs.remove(newTabId);
            clearInterval(closeTab);
        };
    }, 0);
    chrome.scripting.executeScript({
        target: { tabId: newTabId },
        func: () => {
            function simulateMouseEvent(element, eventName, coordX, coordY) {
                element.dispatchEvent(new MouseEvent(eventName, {
                    view: window,
                    bubbles: true,
                    cancelable: true,
                    clientX: coordX,
                    clientY: coordY,
                    button: 0
                  }));
            };
            
            window.onload = function() {
                const formSubmit = document.querySelector('#mG61Hd > div.RH5hzf.RLS9Fe > div > div.ThHDze > div.DE3NNc.CekdCb > div.lRwqcd > div > span > span');
                const box = formSubmit.getBoundingClientRect();
                const coordX = box.left - (box.right - box.left) / 2;
                const coordY = box.top + (box.bottom - box.top) / 2;
                
                simulateMouseEvent(formSubmit, 'mousedown', coordX, coordY);
                simulateMouseEvent(formSubmit, 'mouseup', coordX, coordY);
            }
        }
    });
    
})

chrome.storage.sync.get("name", ({ name }) => {
    if (name) {
        inputName.value = name;
    }
});
chrome.storage.sync.get('id', ({ id }) => {
    if (id) {
        inputId.value = id;
    }
});
chrome.storage.sync.get('history', ({ history = [] }) => {
    const now = new Date();
    const today = `${now.getDate()}/${now.getMonth()}/${now.getFullYear()}`;
    const isCheckedIn = history.includes(today);
    if (isCheckedIn) {
        buttonCheckin.setAttribute('disabled', true);
        helperSpan.style.display('block');
    } else {
        buttonCheckin.removeAttribute('disabled');
        helperSpan.style.display('none');
    }
})