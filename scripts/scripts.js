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
/*stock management*/
let expireFridge = [];
let expireFreezer = [];
let stockFridge = [];
let stockFreezer = [];
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

function handleInitialSubmit(event) {
    event.preventDefault();

    initialForm.style.display = 'none';
    dropdownForm.style.display = 'block';
};

inputWord.addEventListener('click', handleInitialSubmit);

/* Get items list from API and sort by alphabet range */ 

function alphabetList(event) {
    event.preventDefault();
    
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
                    const itemName = productArray.find(obj => obj.Name !== undefined).Name;
                    const shelfLifeMin = productArray.find(obj => obj.DOP_Refrigerate_Min !== undefined)?.DOP_Refrigerate_Min;
                    if (!shelfLifeMin) return;
                    const shelfLifeMax = productArray.find(obj => obj.DOP_Refrigerate_Max !== undefined)?.DOP_Refrigerate_Max;
                    const subName = productArray.find(obj => obj.Name_subtitle !== undefined)?.Name_subtitle ?? '';
                    const metricUnit = productArray.find(obj => obj.DOP_Refrigerate_Metric !== undefined)?.DOP_Refrigerate_Metric ?? '';

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
                option.textContent = 'No refrigerated items available.';
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

dropdownSelect.addEventListener('change', alphabetList);
letterSelect.addEventListener('change', alphabetList);

/* Add selected item to stock list */
function pushItemToStock(event) {
    event.preventDefault(); 
    
    const selectedOption = letterList.options[letterList.selectedIndex];

    const [namePart, _] = selectedOption.textContent.split(' - Suggested Shelf Life: ');
    const [itemName, subName] = namePart.split(': ');

    const shelfLifeInfo = selectedOption.textContent.match(/Suggested Shelf Life: (\d+) to (\d+)\s*(\w+)/);
    
    if (!shelfLifeInfo) return;

    const minLife = parseInt(shelfLifeInfo[1]);
    const maxLife = parseInt(shelfLifeInfo[2]);
    const lifeMetric = shelfLifeInfo[3];


    const newItem = {
        name: itemName,
        subName: subName ?? '',
        shelfLifeMin: Number(minLife),
        shelfLifeMax: Number(maxLife), 
        lifeMetric: lifeMetric,
        shelfLifeRemaining: maxLife
    }; 

    stockFridge.push(newItem);
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

    if (stockFridge.length === 0) {
        const noItemElement = document.createElement('div');
        noItemElement.className = 'no-item';
        noItemElement.textContent = 'No items in stock.';
        document.querySelector('.stock-item').appendChild(noItemElement);
    }

    else {
        stockFridge.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'item-instock';
            document.querySelector('.stock-item').appendChild(itemElement);

            const contentBox = document.createElement('div');
            contentBox.className = 'item-content';
            itemElement.appendChild(contentBox);

            const itemName = document.createElement('span');
            itemName.className = 'item-name';
            if (item.subName) {
                itemName.textContent = `${item.name}: ${item.subName}`;
            }
            else {
                itemName.textContent = `${item.name}`;
            }
            contentBox.appendChild(itemName);

            const itemShelfLife = document.createElement('div');
            itemShelfLife.className = 'shelf-life-bar-container';
            const shelfLifeBar = document.createElement('div');
            shelfLifeBar.className = 'shelf-life-bar-progress';

            shelfLifeBar.style.width = `${(item.shelfLifeRemaining / item.shelfLifeMax) * 100}%`;

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
};
renderStock();

function renderExpire() {
    document.querySelector('.expire-item').innerHTML = '';

    if (expireFridge.length === 0) {
        const noItemElement = document.createElement('div');
        noItemElement.className = 'no-item';
        noItemElement.textContent = 'No items are expiring.';
        document.querySelector('.expire-item').appendChild(noItemElement);
    }

    else {
        expireFridge.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'item-expiring';
            document.querySelector('.expire-item').appendChild(itemElement);

            const contentBox = document.createElement('div');
            contentBox.className = 'item-content';
            itemElement.appendChild(contentBox);

            const itemName = document.createElement('span');
            itemName.className = 'item-name';
            if (item.subName) {
                itemName.textContent = `${item.name}: ${item.subName}`;
            }
            else {
                itemName.textContent = `${item.name}`;
            }
            contentBox.appendChild(itemName);

            const itemShelfLife = document.createElement('div');
            itemShelfLife.className = 'shelf-life-bar-container';
            const shelfLifeBar = document.createElement('div');
            shelfLifeBar.className = 'shelf-life-bar-progress';

            shelfLifeBar.style.width = `${(item.shelfLifeRemaining / item.shelfLifeMax) * 100}%`;

            contentBox.appendChild(itemShelfLife);
            itemShelfLife.appendChild(shelfLifeBar);
        });
    };
};
renderExpire();

/* Check days left */
function updateShelfLife() {
    expireFridge = []; 

    stockFridge.forEach(item => {
        if (item.shelfLifeRemaining >= 7) {
            item.shelfLifeRemaining -= 1; 
        }
        else if (item.shelfLifeRemaining > 0 && item.shelfLifeRemaining < 7) {
            item.shelfLifeRemaining -= 1; 
            expireFridge.push(item);
        }
        else {
            item.shelfLifeRemaining = 0;
            expireFridge.push(item);
        }
    });
}
