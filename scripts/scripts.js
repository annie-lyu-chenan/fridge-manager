/* WRITE YOUR JS HERE... YOU MAY REQUIRE MORE THAN ONE JS FILE. IF SO SAVE IT SEPARATELY IN THE SCRIPTS DIRECTORY */

/*stock management*/
let expireFridge = [];
let expireFreezer = [];
let stockFridge = [];
let stockFreezer = [];
const historyWords = [
/* Defalt items in the dropdown */ 
    {name: "Egg", suggestedUse: "30days", quantity: "12", unit: "pcs"},
    {name: "Eggplant", suggestedUse: "10days", quantity: "2", unit: "pcs"},
    {name: "Milk", suggestedUse: "7days", quantity: "1000", unit: "ml"}
];

const inputWord = document.querySelector('#initial-state input'); 
const initialForm = document.querySelector('#initial-state');
const dropdownForm = document.querySelector('#dropdown-state');
const dropdownSelect = document.querySelector('#dropdown-state select');
const selectButton = document.querySelector('#dropdown-state button');

function handleInitialSubmit(event) {
    event.preventDefault();
    const inputValue = inputWord.value.trim().toLowerCase();
    const matchedItems = historyWords.filter(item =>
    item.name.toLowerCase().startsWith(inputValue));

    if (matchedItems.length > 0) {
        dropdownSelect.innerHTML = matchedItems.map(item =>
            `<option value = "${item.name}">${item.name} (Quantity: ${item.quantity}${item.unit}, Suggested Use: ${item.suggestedUse}</option>`
        ).join('') + '<option>Add Something Fresh</option>';
    } 
    else {
        dropdownSelect.innerHTML = '<option>Add Something Fresh</option>';
    }

    initialForm.style.display = 'none';
    dropdownForm.style.display = 'block';
};

initialForm.addEventListener('input', handleInitialSubmit);

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
            itemElement.innerHTML = `
                <span class="item-name">${item.name}</span>
                <progress value = ${parseInt(item.suggestedUse)} class="item-quantity"></progress>
                <span class="item-amount">${item.quantity} ${item.unit}</span>
            `;
            document.querySelector('.stock-item').appendChild(itemElement);
        });
    };
};
renderStock();

function handleDropdownSubmit(event) {
    event.preventDefault();
    const selectedOption = dropdownSelect.value;
    let newItem;

    if (selectedOption === 'Add Something Fresh') {
        window.location.href = 'newitem.html';
    } 
    else {
        const item = historyWords.find(i => i.name === selectedOption);
        if (item) {
            newItem = {
                name: item.name,
                suggestedUse: item.suggestedUse, 
                quantity: item.quantity,
                unit: item.unit,
            };
        }
        stockFridge.push(newItem);
        renderStock();
    }
    
};

selectButton.addEventListener('click', handleDropdownSubmit);

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
            itemElement.className = 'item-expireing';
            itemElement.innerHTML = `
                <span class="item-name">${item.name}</span>
                <progress value = ${parseInt(item.suggestedUse)} class="item-quantity"></progress>
                <span class="item-amount">${item.quantity} ${item.unit}</span>
            `;
            document.querySelector('.expire-item').appendChild(itemElement);
        });
    };
};
renderExpire();

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
