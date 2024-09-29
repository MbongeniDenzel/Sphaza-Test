function showPage(pageId) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        page.classList.add('hidden');
    });

    const activePage = document.getElementById(pageId);
    activePage.classList.remove('hidden');
}

document.addEventListener('DOMContentLoaded', function() {
    const switchElement = document.getElementById('availability-switch');
    const availabilityText = document.getElementById('availability-text');
    const dateTimePicker = document.getElementById('date-time-picker');

    // Toggle switch and update status
    switchElement.addEventListener('change', function() {
        if (this.checked) {
            // Switch is ON (Available)
            availabilityText.textContent = 'Available';
            dateTimePicker.style.display = 'none'; // Hide date-time picker
            updateAvailability(true);
        } else {
            // Switch is OFF (Unavailable)
            availabilityText.textContent = 'Unavailable';
            dateTimePicker.style.display = 'block'; // Show date-time picker
        }
    });

    // Function to update availability status
    function updateAvailability(isAvailable) {
        const data = {
            available: isAvailable
        };

        // Replace with your actual API endpoint
        fetch('/api/update-availability', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }

    // Function to save return time
    window.saveReturnTime = function() {
        const returnTime = document.getElementById('return-time').value;

        if (!returnTime) {
            alert('Please select a return time.');
            return;
        }

        const data = {
            available: false,
            estimatedReturnTime: returnTime
        };

        // Replace with your actual API endpoint
        fetch('/api/update-availability', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            // Optionally hide the date-time picker after saving
            dateTimePicker.style.display = 'none';
            switchElement.checked = true; // Reset switch to ON (Available)
            availabilityText.textContent = 'Available';
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }
});



function fetchCategory(category) {
    const page = document.getElementById('Snac'); 
    showPage('Product');  // Unhide the page element

    const itemsList = document.getElementById('items-list');
    fetch(`/api/products/${category}`)
        .then(response => response.json())
        .then(data => {
            itemsList.innerHTML = '';  // Clear previous content
            console.log(data);
            if (data && Array.isArray(data.data)) {
                data.data.forEach(product => {
                    const productCard = document.createElement('div');
                    productCard.classList.add('snack-card');
                    productCard.innerHTML = `
                        <div class="product-card" data-product-id="${product.ProductID}">
                            <h2>${product.productCategory}</h2>
                            <p><strong>Name:</strong> <input type="text" value="${product.ProductName}" class="product-name-input"></p>
                            <p><strong>Price: R</strong> <input type="number" value="${product.productPrice}" class="product-price-input" step="0.01"></p>
                            <p><strong>Quantity:</strong> <input type="number" value="${product.productQty}" min="1" class="product-quantity-input"></p>
                            <img src="${product.image_url}" alt="image">
                            <button class="btn update">Update</button>
                        </div>
                    `;

                    itemsList.appendChild(productCard);
                });
            } else {
                itemsList.textContent = 'No items found or error in response structure.';
            }
        })
        .catch(error => {
            console.error('Error fetching products:', error);
        });
}
document.addEventListener('DOMContentLoaded', function() {
    const itemsList = document.getElementById('items-list');
    
    if (itemsList) {
        itemsList.addEventListener('click', function(event) {
            if (event.target.classList.contains('update')) {
                const productCard = event.target.closest('.product-card');
                const productId = productCard.getAttribute('data-product-id');
                const productName = productCard.querySelector('.product-name-input').value;
                const productPrice = productCard.querySelector('.product-price-input').value;
                const quantity = productCard.querySelector('.product-quantity-input').value;

                // Fetch API call to update product details and add to cart
                fetch('/api/updateProduct', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        productId: productId,
                        productName: productName,
                        productPrice: parseFloat(productPrice),
                        quantity: parseInt(quantity)
                    })
                })
                .then(response => response.text())
                .then(data => {
                    console.log(data);
                    alert('Product updated successfully!');
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('Failed to update product');
                });
            }
        });
    }
});
