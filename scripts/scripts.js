/* WRITE YOUR JS HERE... YOU MAY REQUIRE MORE THAN ONE JS FILE. IF SO SAVE IT SEPARATELY IN THE SCRIPTS DIRECTORY */
/* Search bar dropdown list */
const inputWord = document.querySelector('#initial-state input'); 
const initialForm = document.querySelector('#initial-state');
const dropdownForm = document.querySelector('#dropdown-state');
const dropdownSelect = document.querySelector('#dropdown-state select');
const addBtn = document.querySelector('#full-list button');
const addList = document.querySelector('#full-list');
const fullListForm = document.querySelector('#tags');
const letterSelect = document.querySelector('#tags select');
const letterList = document.querySelector('#alphabet-list');
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
                    const shelfLifeMin = productArray.find(obj => obj.DOP_Refrigerate_Min !== undefined)?.DOP_Refrigerate_Min ?? 'N/A';
                    const shelfLifeMax = productArray.find(obj => obj.DOP_Refrigerate_Max !== undefined)?.DOP_Refrigerate_Max ?? 'N/A';

                    fullListArray.push({ 
                        name: itemName, 
                        min: shelfLifeMin, 
                        max: shelfLifeMax 
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

            fullListArray.forEach(item => {
                const firstLetter = item.name.charAt(0).toLowerCase();
                if (selectedRange.includes(firstLetter)) {
                    const option = document.createElement('option');
                    option.value = item.name;
                    option.textContent = `${item.name} - Suggested Shelf Life: ${item.min} to ${item.max} Days`;
                    letterList.appendChild(option);
                }
            });

            initialForm.style.display = 'none';
            dropdownForm.style.display = 'none';
            addList.style.display = 'flex'; 
        })
}

dropdownSelect.addEventListener('change', alphabetList);
letterSelect.addEventListener('change', alphabetList);

/* Add selected item to stock list */
function pushItemToStock() {
    const selectedOption = letterList.options[letterList.selectedIndex].value;
    const itemName = selectedOption.value;

    const shelfLifeInfo = selectedOption.textContent.match(/Suggested Shelf Life: (\d+) to (\d+) Days/);
    let suggestedUse = 'N/A';
    if (shelfLifeInfo) {
        const minDays = parseInt(shelfLifeInfo[1]);
        const maxDays = parseInt(shelfLifeInfo[2]);
        suggestedUse = `${minDays}-${maxDays} days`;
    }

    const newItem = {
        name: itemName,
        suggestedUse: suggestedUse,
        quantity: 1,
        unit: 'pcs'
    };

    stockFridge.push(newItem);
    renderStock();
}

addBtn.addEventListener('click', pushItemToStock);

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

            const itemName = document.createElement('span');
            itemName.className = 'item-name';
            itemName.textContent = `${item.name}`;

            itemElement.appendChild(itemName);
            document.querySelector('.stock-item').appendChild(itemElement);
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

            const itemName = document.createElement('span');
            itemName.className = 'item-name';
            itemName.textContent = `${item.name}`;

            itemElement.appendChild(itemName);
            document.querySelector('.expire-item').appendChild(itemElement);
        });
    };
};
renderExpire();

/* Check expire items */
function checkExpireItems() {
    expireFridge = stockFridge.filter(item => {
        const suggestedUseDays = parseInt(item.suggestedUse);
        return suggestedUseDays <= 7; 
    });
    renderExpire();
}
setInterval(checkExpireItems, 86400000); 


/*
if (expireFridge.length === 0) {
    const noItemElement = document.createElement('div');
    noItemElement.className = 'no-item';
    noItemElement.textContent = 'No items expiring.';
    document.querySelector('.expire-item').appendChild(noItemElement);
}; 

expireFridge.forEach(item => {
    const itemElement = document.createElement('div');
    itemElement.className = 'item-expireing';
    itemElement.innerHTML = `
        <span class="item-name">${item.name}</span>
        <progress value = ${item.suggestedUse} class="item-quantity"></progress>
        <span class="item-amound">${item.quantity} ${item.unit}</span>
        <span class="item-status">${item.status}</span>
    `;
    document.querySelector('.expire-item').appendChild(itemElement);
});
*/