// const { response } = require("express");

// code to move through pages
function showPage(pageId) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        page.classList.add('hidden');
    });

    const activePage = document.getElementById(pageId);
    activePage.classList.remove('hidden');
}


carts = [];

function fetchCategory(category) {
    const page = document.getElementById('Snac'); 
    showPage('Snac');  // Unhide the page element

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
                    <div class = 'pruduct-card' product-id = ${product.ProductID}>
                        <h2>${product.productCategory}</h2>
                        <p><strong>Name:</strong> ${product.ProductName}</p>
                        <p><strong>Price:R</strong> ${product.productPrice}</p>
                        <img src="${product.image_url}" alt="image">
                         <button class="btn btn-add">Add to cart</button>
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

// Move the event listener outside the function
document.addEventListener('DOMContentLoaded', function() {
    const itemsList = document.getElementById('items-list');
    
    if (itemsList) {
        itemsList.addEventListener('click', function(event) {
            if (event.target.classList.contains('btn-add')) {
                const productCard = event.target.parentElement;
                const productID = productCard.getAttribute('product-id');
                const productName = productCard.querySelector('p:nth-of-type(1)').textContent.split(':')[1].trim();
                const productPrice = productCard.querySelector('p:nth-of-type(2)').textContent.split(':R')[1].trim();
                const productImage = productCard.querySelector('img').src;

                const newProduct = { id:productID, name: productName, price: productPrice, image: productImage };
                addCart(newProduct);
                
                // Change button to green and update text
                event.target.classList.add('btn-added');
                event.target.textContent = 'Added';
                event.target.disabled = true; // Optional: Disable button after adding
            }
        });
    } else {
        console.error('itemsList element not found in the DOM');
    }
});



// Get the element where the snack items will be listed


// Attach the event listener once, on page load or initial setup


function addCart(newSnack){
    fetch('/cart-add-to', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newSnack)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}



// fetch items from tje cart

function cart_items() {
    const itemsList = document.getElementById('cart-items');

    showPage('Cart');

    fetch('/cart-get-all')
        .then(response => response.json())
        .then(data => {
            carts = data;
            console.log('API response:', data); // Log the response for debugging
            itemsList.innerHTML = ''; // Clear existing items

            if (Array.isArray(data)) {
                data.forEach(item => {
                    const snackCard = document.createElement('div');
                    snackCard.classList.add('snack-card');
                    snackCard.innerHTML = `
                <div class = 'product-card' prod-id = ${item.id}>
                        <h2> ${item.name}</h2>
                        <p><strong>Price: </strong> ${item.price}</p>
                         <img src="${item.image}" alt="image">
                        <div class="quantity-controls">
                            <button class="btn-quantity decrease">-</button>
                            <input type="number" class="quantity-input" value="1" min="1">
                            <button class="btn-quantity increase">+</button>
                        </div>
                        <button class="btn btn-remove">Remove Item</button>
                </div>
                    `;


                    const decreaseBtn = snackCard.querySelector('.decrease');
                    const increaseBtn = snackCard.querySelector('.increase');
                    const quantityInput = snackCard.querySelector('.quantity-input');

                    decreaseBtn.addEventListener('click', () => {
                        let currentValue = parseInt(quantityInput.value);
                        if (currentValue > 1) {
                            quantityInput.value = currentValue - 1;
                        }
                    });

                    increaseBtn.addEventListener('click', () => {
                        let currentValue = parseInt(quantityInput.value);
                        quantityInput.value = currentValue + 1;
                    });

                    itemsList.appendChild(snackCard);
                    updateCartOptionsVisibility();
                });
            } else {
                itemsList.textContent = 'No items found or error in response structure.';
            }
        })
        .catch(error => {
            console.error('Error fetching snacks:', error);
        });
}




// document.addEventListener("DOMContentLoaded", function(){
//     const cartPage = document.getElementById('Cart');
//     if(cartPage&& !cartPage.classList.contains('hidden')){
//         cart_iterms();
//     }
// });

function updateCartOptionsVisibility() {
    const itemsList = document.getElementById('cart-items');
    const cartOptionsContainer = document.getElementById('cart-options-container');
    const checkoutButton = document.getElementById('checkout-button')

    if (itemsList && itemsList.children.length > 0) {
        cartOptionsContainer.style.display = 'block'; // Show options
        checkoutButton.style.display = 'block'
    } else {
        cartOptionsContainer.style.display = 'none'; // Hide options
    }
}

// Call this function whenever items are added or removed from the cart
document.addEventListener('DOMContentLoaded', function() {
    const cartList = document.getElementById('cart-items');
    
    if (cartList) {
        cartList.addEventListener('click', function(event) {
            // Check if the clicked element is the "Remove Item" button
            if (event.target.classList.contains('btn-remove')) {
                const cartItem = event.target.closest('.snack-card'); // Assuming each cart item is wrapped in a container with a class of "cart-item"
                
                if (cartItem) {
                    const productName = cartItem.querySelector('h2').textContent.trim();

                    // Call the function to remove the item from the cart
                    removeItemFromCart(productName);
                    
                    // Optionally, remove the item from the DOM
                    cartItem.remove();
                } else {
                    console.error('Cart item container not found');
                }
            }
        });
    } else {
        console.error('cartList element not found in the DOM');
    }
});

function removeItemFromCart(productName) {
    // Find the index of the item in the cart array
    const itemIndex = carts.findIndex(item => item.name === productName);

    if (itemIndex !== -1) {
        // Remove the item from the cart array
        carts.splice(itemIndex, 1);
        console.log(`Item ${productName} removed from the cart`);
        
        // Optionally, send a DELETE request to the server to update the cart on the backend
        fetch(`/cart/${productName}`, {
            method: 'DELETE'
        })
            .then(response => response.json())
            .then(data => {
                console.log('Server response:', data);
                // Optionally, refresh the cart or update the UI
            })
            .catch(error => {
                console.error('Error:', error);
            });
    } else {
        console.error(`Item ${productName} not found in the cart`);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const checkoutBtn = document.querySelector('.checkout-button');
    // Updated selector

    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            const orderID = (Math.floor(100000 + Math.random() * 900000)).toString();
            console.log('Order number:', orderID);

           addToOrderTable(orderID);
            addToOrderProduct(orderID);
            updateStock();
            
            fetch(`/cart-clear`, {
                method: 'DELETE'
            })
            .then(response => response.json())
            .then(data => {
                console.log('Server response:', data);
                document.querySelector('.cart-items').innerHTML = '';
            })
            .catch(error => {
                console.error('Error:', error);
            });
            showOrders()
            updateCartOptionsVisibility()
        });
    }
});

function addToOrderTable(orderID) {
    const customerID = 'cust1156';
    const employeeID = 'emp1234';
    const delivery = document.querySelector('input[name="delivery"]:checked').value;
    const payment = document.querySelector('input[name="payment"]:checked').value;

    fetch('/new-order', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            orderID: orderID,
            customerID: customerID,
            employeeID: employeeID,
            delivery: delivery,
            paymentMethod: payment
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Order added to table', orderID);
    })
    .catch(err => {
        console.error('There was an error', err);
    });
}


function addToOrderProduct(orderID){
    const itemsList = document.querySelectorAll('#cart-items .product-card')
    itemsList.forEach(item => {
        const productID = item.getAttribute('prod-id');
                console.log('Product ID:', productID); // Debugging line to check if productID is fetched

                if (!productID) {
                    console.error('Product ID is null or undefined for this item:', item);
                    return; // Skip this item if productID is not found
                }

                const quantity = parseFloat(item.querySelector('.quantity-input').value) || 0;

                // Extract the price from the element
                const priceText = item.querySelector('p strong').nextSibling ? 
                    item.querySelector('p strong').nextSibling.nodeValue.trim() : '0';
                
                // Convert the price to a number
                const priceValue = parseFloat(priceText) || 0;
                
                // Calculate the total price
                const totalPrice = priceValue * quantity;
        console.log(productID,quantity,totalPrice);
        fetch('/order-product', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                orderID: orderID,
                ProductID: productID,
                qty: quantity,
                itemPrice: totalPrice
            })
        })
        .then(response => response.json())
        .then(data => {
            console.log('Item stored in orderproduct:', data);
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });
}



function updateStock(){
    const itemsList = document.querySelectorAll('#cart-items .product-card')
    itemsList.forEach(item => {
        const productID = item.getAttribute('prod-id');
                console.log('Product ID:', productID); // Debugging line to check if productID is fetched

                if (!productID) {
                    console.error('Product ID is null or undefined for this item:', item);
                    return; // Skip this item if productID is not found
                }

        const quantity = item.querySelector('.quantity-input').value;
        
        console.log(productID,quantity);
        fetch('/update-stock', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
               
                ProductID: productID,
                qty: quantity
                
            })
        })
        .then(response => response.json())
        .then(data => {
            console.log('Stock has been updated:', data);
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });

}


function displayFeedbackPage(orderID) {
    // Show the feedback page
    showPage('prev-orders');
    
    // Set the order number on the page
    const orderNum = document.getElementById('orderNum');
    orderNum.innerHTML = `Order Number: ${orderID}`;

    // Get all the stars and attach click event listeners
    const stars = document.querySelectorAll('.star');
    let selectedRating = 0;

    stars.forEach(star => {
        star.addEventListener('click', function() {
            selectedRating = this.getAttribute('data-value');
            stars.forEach(s => s.classList.remove('selected'));
            this.classList.add('selected');
        });
    });

    // Attach the click event listener to the submit button
    const submitBtn = document.getElementById('submit-feedback');
    submitBtn.addEventListener('click', function() {

        const comments = document.getElementById('feedback-comments').value;
        
        if (selectedRating === 0) {
            alert('Please select a rating.');
            return;
        }

        if (!comments.trim()) {
            alert('Please enter your comments.');
            return;
        }

        const feedbackData = {
            orderID: orderID,
            OrderRating: selectedRating,
            orderFeedBack: comments.trim()
        };

        fetch('/update-feedback', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(feedbackData)
        })
        .then(response => {
            console.log('Fetch response received:', response);
            return response.json();
        })
        .then(data => {
            console.log('Feedback submitted successfully:', data);
            
            
        })
        .catch(error => {
            console.error('Error submitting feedback:', error);
            alert('There was an error submitting your feedback. Please try again.');
        });
        alert('Thank you for your feedback!');
        showOrders();
    });
}



function showOrders(){
    showPage('Orders-page');
    const itemsList = document.getElementById('order-page-items');
    fetch(`/get-orders`)
        .then(response => response.json())
        .then(data => {
            itemsList.innerHTML = '';  // Clear previous content
            console.log(data);
            if (data && Array.isArray(data.data)) {
                data.data.forEach(orders => {
                    const productCard = document.createElement('div');
                    productCard.classList.add('snack-card');
                            // Check if the order details are a string
                                const orderDetailsString = typeof orders.OrderDetails === 'string' ? orders.OrderDetails : '';

                                // Split the details string into an array
                                const detailsArray = orderDetailsString.split(' | ');

                                // Build the order details table
                                let orderDetailsHtml = `
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Product ID</th>
                                                <th>Name</th>
                                                <th>Quantity</th>
                                                <th>Price</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                `;

                                if (detailsArray.length > 0) {
                                    detailsArray.forEach(detail => {
                                        const detailParts = detail.split(', '); // Split each detail into key-value pairs

                                        // Create an object to store the detail values
                                        const detailObj = {};
                                        detailParts.forEach(part => {
                                            const [key, value] = part.split(': ');
                                            detailObj[key.trim()] = value.trim();
                                        });

                                        // Add a row to the table for each product
                                        orderDetailsHtml += `
                                            <tr>
                                                <td>${detailObj.ProductID || 'N/A'}</td>
                                                <td>${detailObj.ProductName || 'N/A'}</td>
                                                <td>${detailObj.Qty || 'N/A'}</td>
                                                <td>${detailObj.Price || 'N/A'}</td>
                                            </tr>
                                        `;
                                    });
                                } else {
                                    orderDetailsHtml += `
                                        <tr>
                                            <td colspan="4">No details available</td>
                                        </tr>
                                    `;
                                }

                    orderDetailsHtml += `
                            </tbody>
                        </table>
                    `;

                    // Set the inner HTML of the product card
                    productCard.innerHTML = `
                        <div class='product-card' order-id='${orders.orderID}'>
                            <h2>Order ID: ${orders.orderID}</h2>
                            <div><strong>Order Details:</strong>${orderDetailsHtml}</div>
                            <button class="btn feedback-add">Add your feedback</button>
                        </div>
                    `;

// Append the product card to the items list


                    
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
    const itemsList = document.getElementById('order-page-items');
    
    if (itemsList) {
        itemsList.addEventListener('click', function(event) {
            if (event.target.classList.contains('feedback-add')) {
                const productCard = event.target.parentElement;
                const orderID = productCard.getAttribute('order-id');
                
                displayFeedbackPage(orderID);
                
               
            }
        });
    } else {
        console.error('order-page items element not found in the DOM');
    }
});





































































