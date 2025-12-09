/* WRITE YOUR JS HERE... YOU MAY REQUIRE MORE THAN ONE JS FILE. IF SO SAVE IT SEPARATELY IN THE SCRIPTS DIRECTORY */
/* Search bar dropdown list */
const inputWord = document.querySelector('#initial-state input'); 
const initialForm = document.querySelector('#initial-state');
const dropdownForm = document.querySelector('#dropdown-state');
const dropdownSelect = document.querySelector('#dropdown-state select');
const addBtn = document.querySelector('#full-list #add-btn');
const addList = document.querySelector('#full-list');
const letterSelect = document.querySelector('#alphabet-select');
const letterList = document.querySelector('#alphabet-list');
const cancelBtn = document.querySelector('#full-list #cancel-btn');
const fridgeBtn = document.querySelector('#fridge-btn');
const freezerBtn = document.querySelector('#freezer-btn');
const colorBlindSwitchLeft = document.querySelector('#color-blind-container .ph-toggle-left');
const colorBlindSwitchRight = document.querySelector('#color-blind-container .ph-toggle-right');
let currentMode = ''; 
/*stock management*/
let expireFridge = [];
let expireFreezer = [];
let stockFridge = JSON.parse(localStorage.getItem('stockFridge')) || [];
let stockFreezer = JSON.parse(localStorage.getItem('stockFreezer')) || [];
const categoryMap = {
    'baby-food': { ids: [1], name: 'Baby Food' },
    'baked-goods': { ids: [2, 3, 4], name: 'Baked Goods' },
    'beverages': { ids: [5], name: 'Beverages' },
    'dairy-and-eggs': { ids: [7], name: 'Dairy Products & Eggs' },
    'grain-and-beans': { ids: [9], name: 'Grains, Beans & Pasta' },
    'meat': { ids: [10, 11, 12, 13], name: 'Meat' },
    'poultry': { ids: [14, 15, 16, 17], name: 'Poultry' },
    'produce': { ids: [18, 19], name: 'Produce' },
    'seafood': { ids: [20, 21, 22], name: 'Seafood' }
};
/* 
const historyWords = [
    {name: "Egg", suggestedUse: "30days", quantity: "12", unit: "pcs"},
    {name: "Eggplant", suggestedUse: "10days", quantity: "2", unit: "pcs"},
    {name: "Milk", suggestedUse: "7days", quantity: "1000", unit: "ml"}
];
*/

if (!window.location.pathname.includes('freezer.html')) {
    currentMode = 'Refrigerate';
} 
else if (window.location.pathname.includes('freezer.html')) {
    currentMode = 'Freeze';
}

function handleInitialSubmit(event) {
    event.preventDefault();

    initialForm.style.display = 'none';
    dropdownForm.style.display = 'block';

};

inputWord.addEventListener('click', handleInitialSubmit);

/* Get items list from API and sort by alphabet range */ 
function alphabetList(event, mode) {
    if (event) event.preventDefault();
    currentMode = mode;
    
    const optionID = dropdownSelect.options[dropdownSelect.selectedIndex].id;
    const allCategoryID = categoryMap[optionID].ids;

    fetch('foodkeeper.json')
        .then(response => response.json())
        .then(json => {
                
            const allItems = json.sheets.find(p => p.name === 'Product').data;
            letterList.innerHTML = '';
            let fullListArray = [];

            allItems.forEach((productArray) => {

                const categoryItem = productArray.find(obj => obj.Category_ID !== undefined);
                const categoryID = categoryItem.Category_ID;

                if (allCategoryID.includes(categoryID)) {
                    const modeFieldMap = {
                        Refrigerate: 'Refrigerate',
                        Freeze: 'Freeze'
                    };
                    const fieldPrefix = modeFieldMap[mode];
                    
                    const itemName = productArray.find(obj => obj.Name !== undefined).Name;
                    const shelfLifeMin = productArray.find(obj => obj[`DOP_${fieldPrefix}_Min`] !== undefined)?.[`DOP_${fieldPrefix}_Min`];
                    if (!shelfLifeMin) return;
                    const shelfLifeMax = productArray.find(obj => obj[`DOP_${fieldPrefix}_Max`] !== undefined)?.[`DOP_${fieldPrefix}_Max`];
                    const subName = productArray.find(obj => obj.Name_subtitle !== undefined)?.Name_subtitle ?? '';
                    const metricUnit = productArray.find(obj => obj[`DOP_${fieldPrefix}_Metric`] !== undefined)?.[`DOP_${fieldPrefix}_Metric`] ?? '';
                    fullListArray.push({ 
                        name: itemName,
                        subName: subName,
                        min: shelfLifeMin, 
                        max: shelfLifeMax, 
                        metric: metricUnit
                    });
                }
            })

            const rangeMap = {
                'ad': ['a', 'b', 'c', 'd'],
                'eh': ['e', 'f', 'g', 'h'],
                'il': ['i', 'j', 'k', 'l'],
                'mp': ['m', 'n', 'o', 'p'],
                'qt': ['q', 'r', 's', 't'],
                'ux': ['u', 'v', 'w', 'x'],
                'yz': ['y', 'z']
            };
            const tagValue = letterSelect.options[letterSelect.selectedIndex].value;
            const selectedRange = rangeMap[tagValue];

            const matchedItems = fullListArray.filter(item => {
                const firstLetter = item.name.charAt(0).toLowerCase();
                return selectedRange.includes(firstLetter);
            });

            if (matchedItems.length === 0) {
                const option = document.createElement('option');
                option.value = 'no-item';
                option.textContent = 'No items available.';
                letterList.appendChild(option);
            }
            else {
                matchedItems.forEach(item => {
                    const option = document.createElement('option');
                    option.value = item.name;
                    if (item.subName) {
                        if (item.min == item.max) {
                            option.textContent = `${item.name}: ${item.subName} - Suggested Shelf Life: ${item.min} ${item.metric}`;
                            letterList.appendChild(option);
                            return;
                        }
                        else {
                            option.textContent = `${item.name}: ${item.subName} - Suggested Shelf Life: ${item.min} to ${item.max} ${item.metric}`;
                            letterList.appendChild(option);
                            return;
                        }
                    }
                    else {
                        if (item.min == item.max) {
                            option.textContent = `${item.name} - Suggested Shelf Life: ${item.min} ${item.metric}`;
                            letterList.appendChild(option);
                            return;
                        }
                        else {
                            option.textContent = `${item.name} - Suggested Shelf Life: ${item.min} to ${item.max} ${item.metric}`;
                            letterList.appendChild(option);
                            return;
                        }
                    }
                });
                
            }
        });

        initialForm.style.display = 'none';
        dropdownForm.style.display = 'none';
        addList.style.display = 'flex'; 
}

dropdownSelect.addEventListener('change', (e) => alphabetList(e, currentMode));
letterSelect.addEventListener('change', (e) => alphabetList(e, currentMode));
fridgeBtn.addEventListener('click', (e) => {
    initialForm.style.display = 'flex';
    dropdownForm.style.display = 'none';
    addList.style.display = 'none';
    renderStock();  
});
freezerBtn.addEventListener('click', (e) => {
    initialForm.style.display = 'flex';
    dropdownForm.style.display = 'none';
    addList.style.display = 'none';
    renderStock(); 
});

/* Add selected item to stock list */
function pushItemToStock(event) {
    event.preventDefault(); 
    
    const selectedOption = letterList.options[letterList.selectedIndex];

    const [namePart, _] = selectedOption.textContent.split(' - Suggested Shelf Life: ');
    const [itemName, subName] = namePart.split(': ');

    const rangeMatch = selectedOption.textContent.match(/Suggested Shelf Life: (\d+) to (\d+)\s*(\w+)/);
    const singleMatch = selectedOption.textContent.match(/Suggested Shelf Life: (\d+)\s*(\w+)/);

    let minLife, maxLife, lifeMetric;

    if (rangeMatch) {
        minLife = parseInt(rangeMatch[1]);
        maxLife = parseInt(rangeMatch[2]);
        lifeMetric = rangeMatch[3];
    } else if (singleMatch) {
        minLife = maxLife = parseInt(singleMatch[1]);
        lifeMetric = singleMatch[2];
    } 
    
    if (!rangeMatch && !singleMatch) return;

    const convertToDays = (value, unit) => {
        switch (unit) {
            case 'Days':
                return value;
            case 'Weeks':
                return value * 7;
            case 'Months':
                return value * 30; 
            case 'Years':
                return value * 365;

        }
    };

    minLife = convertToDays(minLife, lifeMetric);
    maxLife = convertToDays(maxLife, lifeMetric);

    const newItem = {
        name: itemName,
        subName: subName ?? '',
        shelfLifeMin: Number(minLife),
        shelfLifeMax: Number(maxLife), 
        shelfLifeRemaining: maxLife
    }; 

    if (currentMode === 'Refrigerate') {
        stockFridge.push(newItem);
        localStorage.setItem('stockFridge', JSON.stringify(stockFridge));
    } else if (currentMode === 'Freeze') {
        stockFreezer.push(newItem);
        localStorage.setItem('stockFreezer', JSON.stringify(stockFreezer));
    }

    renderStock();
}

addBtn.addEventListener('click', pushItemToStock);

function cancelAddItem(event) {
    event.preventDefault();

    addList.style.display = 'none';
    initialForm.style.display = 'block';
}

cancelBtn.addEventListener('click', cancelAddItem);

/* Stock and expire list display */
function renderStock() {
    document.querySelector('.stock-item').innerHTML = '';
    const stockList = currentMode === 'Refrigerate' ? stockFridge : stockFreezer;

    if (stockList.length === 0) {
        const noItemElement = document.createElement('div');
        noItemElement.className = 'no-item';
        noItemElement.textContent = 'No items in stock.';
        document.querySelector('.stock-item').appendChild(noItemElement);
    }

    else {
        stockList.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'item-instock';
            document.querySelector('.stock-item').appendChild(itemElement);

            const contentBox = document.createElement('div');
            contentBox.className = 'item-content';
            itemElement.appendChild(contentBox);

            const deleteBtn = document.createElement('i');
            deleteBtn.className = 'ph ph-x';
            deleteBtn.addEventListener('click', () => {
                deleteItem(item.name, item.subName);
            });
            contentBox.appendChild(deleteBtn);

            const itemName = document.createElement('span');
            itemName.className = 'item-name';
            if (item.subName) {
                itemName.textContent = `${item.name}: ${item.subName}`;
            }
            else {
                itemName.textContent = `${item.name}`;
            }
            contentBox.appendChild(itemName);

            const remainingDays = document.createElement('span');
            remainingDays.className = 'item-days-left';
            remainingDays.textContent = `${item.shelfLifeRemaining} Days`;
            contentBox.appendChild(remainingDays);

            const itemShelfLife = document.createElement('div');
            itemShelfLife.className = 'shelf-life-bar-container';
            const shelfLifeBar = document.createElement('div');
            shelfLifeBar.className = 'shelf-life-bar-progress';

            shelfLifeBar.style.width = `${(Number(item.shelfLifeRemaining) / Number(item.shelfLifeMax)) * 100}%`;

            contentBox.appendChild(itemShelfLife);
            itemShelfLife.appendChild(shelfLifeBar);

            /*
            const shelfLifeLeft = document.createElement('span');
            shelfLifeLeft.className = 'shelf-life-left';
            shelfLifeLeft.textContent = `${item.shelfLifeRemaining} ${item.lifeMetric} before expiration`;
            itemElement.appendChild(shelfLifeLeft);
            */
        });
    };
    document.querySelector('#stock-item-count').textContent = `Total Items: ${stockList.length}`;
};
renderStock();

function renderExpire() {
    document.querySelector('.expire-item').innerHTML = '';
    const expireList = currentMode === 'Refrigerate' ? expireFridge : expireFreezer;

    if (expireList.length === 0) {
        const noItemElement = document.createElement('div');
        noItemElement.className = 'no-item';
        noItemElement.textContent = 'No items are expiring.';
        document.querySelector('.expire-item').appendChild(noItemElement);
    }

    else {
        expireList.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'item-expiring';
            document.querySelector('.expire-item').appendChild(itemElement);

            const contentBox = document.createElement('div');
            contentBox.className = 'item-content';
            itemElement.appendChild(contentBox);

            const deleteBtn = document.createElement('i');
            deleteBtn.className = 'ph ph-x';
            deleteBtn.addEventListener('click', () => {
                deleteItem(item.name, item.subName);
            });
            contentBox.appendChild(deleteBtn);

            const itemName = document.createElement('span');
            itemName.className = 'item-name';
            if (item.subName) {
                itemName.textContent = `${item.name}: ${item.subName}`;
            }
            else {
                itemName.textContent = `${item.name}`;
            }
            contentBox.appendChild(itemName);

            const remainingDays = document.createElement('span');
            remainingDays.className = 'item-days-left';
            remainingDays.textContent = `${item.shelfLifeRemaining} Days`;
            if (item.shelfLifeRemaining == 0) {
                remainingDays.classList.add(`expired-text`);
            }
            contentBox.appendChild(remainingDays);

            const itemShelfLife = document.createElement('div');
            itemShelfLife.className = 'shelf-life-bar-container';
            const shelfLifeBar = document.createElement('div');
            shelfLifeBar.className = 'shelf-life-bar-progress';
            if (item.shelfLifeRemaining == 0) {
                itemShelfLife.classList.add(`expired-container`);
                shelfLifeBar.classList.add(`expired-progress`);
            }

            shelfLifeBar.style.width = `${(Number(item.shelfLifeRemaining) / Number(item.shelfLifeMax)) * 100}%`;

            contentBox.appendChild(itemShelfLife);
            itemShelfLife.appendChild(shelfLifeBar);

        });
    };
    document.querySelector('#expire-item-count').textContent = `Total Items: ${expireList.length}`;
};
renderExpire();

/* delete item */
function deleteItem(name, subName = '') {
    let stockList, expireList, storageKey;

    if (currentMode === 'Refrigerate') {
        stockList = stockFridge;
        expireList = expireFridge;
        storageKey = 'stockFridge';
    } else {
        stockList = stockFreezer;
        expireList = expireFreezer;
        storageKey = 'stockFreezer';
    }

    const updatedStock = stockList.filter(item => !(item.name === name && item.subName === subName));
    const updatedExpire = expireList.filter(item => !(item.name === name && item.subName === subName));

    if (currentMode === 'Refrigerate') {
        stockFridge = updatedStock;
        expireFridge = updatedExpire;
    } else {
        stockFreezer = updatedStock;
        expireFreezer = updatedExpire;
    }

    localStorage.setItem(storageKey, JSON.stringify(updatedStock));

    renderStock();
    renderExpire();
}
    

/* Check days left original
setInterval(updateShelfLife, 86400000); 
*/

/* Check days left test: For demo purpose */
function updateShelfLife() {
    const stockList = currentMode === 'Refrigerate' ? stockFridge : stockFreezer;
    const expireList = currentMode === 'Refrigerate' ? expireFridge : expireFreezer;

    const updatedExpireList = [];

    stockList.forEach(item => {
        item.shelfLifeRemaining = Math.max(0, item.shelfLifeRemaining - 1);

        if (item.shelfLifeRemaining < 7) {
            updatedExpireList.push(item);
        }
    });

    if (currentMode === 'Refrigerate') {
        expireFridge = updatedExpireList;
    } else {
        expireFreezer = updatedExpireList;
    }

    renderStock();
    renderExpire();
}

setInterval(updateShelfLife, 1000); 

/* Clear local storage for testing purpose 
function clearStock() {
    localStorage.removeItem('stockFridge');
    localStorage.removeItem('stockFreezer');
    stockFridge = [];
    stockFreezer = [];
    renderStock();
}
clearStock();
*/

/* color blind mode toggle */
colorBlindSwitchLeft.addEventListener('click', () => {
    document.body.classList.add('color-blind-mode');
    colorBlindSwitchLeft.style.display = 'none';
    colorBlindSwitchRight.style.display = 'inline-block';
});

colorBlindSwitchRight.addEventListener('click', () => {
    document.body.classList.remove('color-blind-mode');
    colorBlindSwitchRight.style.display = 'none';
    colorBlindSwitchLeft.style.display = 'inline-block';
});
