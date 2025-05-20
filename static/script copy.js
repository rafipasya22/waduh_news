const form = document.getElementById('item-form');
const itemList = document.getElementById('items-list');

const API_URL = 'http://127.0.0.1:8000/items';

async function fetchItems() {
    const response = await fetch(API_URL);
    const items = await response.json();
    itemList.innerHTML = '';
    
    items.forEach(item =>{
        const li = document.createElement("li");
        li.innerHTML = `${item.id} - ${item.name} : ${item.description}
        <button class= "update" onclick="updateItem(${item.id})">Update</button>
        <button class="delete" onclick="deleteItem(${item.id})">Delete</button>
        `;
        itemList.appendChild(li);
        
    });
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('item-id').value;
    const name = document.getElementById('item-name').value;
    const description = document.getElementById('item-description').value;

    await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: parseInt(id), name, description })
    });

    form.reset();
    fetchItems();
});

async function deleteItem(id) {
    await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    fetchItems();
}

async function updateItem(id) {
    const name = prompt("Enter new name:");
    const description = prompt("Enter new description:");

    if (name && description) {
        await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, name, description })
        });
        fetchItems();
    }
}

fetchItems();




