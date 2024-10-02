const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const { log, Console } = require('console');
const app = express();
const port = process.env.port|| 33;
const path = require('path');
const http = require('http');

const cartPath = path.join(__dirname, 'src', 'cart.json');
let cart = require(cartPath);
const fs = require('fs');

const server = http.createServer(app); // Create HTTP server using Express app

app.use(cors());
app.use(express.json());

//const cart = require('./public/cart.json');
require('dotenv').config();

app.use(express.static('src'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
//reate a MySQL connection
const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,                            // MySQL database name
    port: 3306,
    ssl: {
    //ca: fs.readFileSync('Sphaza-Test\\DigiCertGlobalRootCA.crt.pem'),
        rejectUnauthorized: true
    }                                               // MySQL port (default is 3306)
});

// Connect to MySQL
db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('Connected to the MySQL database.');
});

// Route to get items in the "snacks" category
app.get('/api/products/:category', (req, res) => {
    const category = req.params.category;
    const sql = `SELECT * FROM product WHERE ProductCategory = ?`;
    db.query(sql, [category], (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({
            message: 'success',
            data: results
        });
        
    });
});


//use cache to save the cart
app.post('/cart-add-to', (req, res) => {
    console.log(req);
    const newItem = req.body;
    console.log(newItem);
    cart.push(newItem);
    res.json(newItem);
});

//delete item in cart
app.delete('/cart/:name', (req, res) => {
    const name = req.params.name;
    const index = cart.findIndex(item => item.name === name);
    
    if (index !== -1) {
        cart.splice(index, 1);
        res.json({ message: `Item with name "${name}" deleted` });
    } else {
        res.status(404).json({ message: `Item with name "${name}" not found` });
    }
});
//get items in the cart
app.get('/cart-get-all', (req, res) => {
    res.json(cart);
});

//api to update the stck after an order is places
app.put('/update-stock', (req, res) => {
    const { ProductID, qty } = req.body;

    const updateQuery = `
        UPDATE product 
        SET productQty = 
            CASE 
                WHEN productQty >= ? THEN productQty - ?
                ELSE 0 
            END
        WHERE  ProductID = ?;
    `;

    db.query(updateQuery, [qty, qty, ProductID], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Failed to update product details');
        }

        if (result.affectedRows > 0) {
            res.send('Product updated successfully!');
        } else {
            res.status(404).send('Product not found');
        }
    });
});



//get all orders to get feedback
app.get('/get-orders',(req,res) =>{
    const sql = `SELECT 
    o.orderID, 
    GROUP_CONCAT(
        CONCAT('ProductID: ', op.ProductID, ', ProductName: ', p.ProductName, ', Qty: ', op.qty, ', Price: ', op.OrderItemPrice)
        SEPARATOR ' | '
    ) AS OrderDetails
FROM 
    orders o
JOIN 
    orderproduct op ON o.orderID = op.orderID
JOIN 
    product p ON op.ProductID = p.ProductID
WHERE 
    o.orderRating IS NULL
GROUP BY 
    o.orderID;
`;
    db.query(sql, (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({
            message: 'success',
            data: results
        });
        
    });

})

// customer puts feedback
app.put('/update-feedback', (req,res) =>{
    const{orderID, OrderRating, orderFeedBack} = req.body;

    const orderUpdate = `update orders set orderRating = ? , orderFeedBack = ? where orderID = ?`;
    db.query(orderUpdate, [OrderRating, orderFeedBack, orderID], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Failed to update feedback and rating');
        }

    
    });
})



//api to upadte the product by the employee
app.put('/api/updateProduct', (req, res) => {
    const { productId, productName, productPrice, quantity } = req.body;

    const updateQuery = `
        UPDATE product 
        SET ProductName = ?, productPrice = ?, productQty = ? 
        WHERE ProductID = ?`;

    db.query(updateQuery, [productName, productPrice, quantity, productId], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Failed to update product details');
        }

        if (result.affectedRows > 0) {
            res.send('Product updated successfully!');
        } else {
            res.status(404).send('Product not found');
        }
    });
});

//post item in orderproduct table
app.post('/order-product', (req,res) =>{
    const { orderID, ProductID, qty, itemPrice } = req.body;
    const inserQuery = `insert into orderproduct (orderID,ProductID,qty,OrderItemPrice) values(?,?,?,?) `;

        
    db.query(inserQuery, [orderID, ProductID, qty, itemPrice], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Failed to add into order-product');
        }

       
    });
    
        

});


//delete everything in cart


app.delete('/cart-clear', (req, res) => {
    cart = []; // Clear the cart array
    
    // Write the empty array back to the cart.json file
    fs.writeFile(cartPath, JSON.stringify(cart, null, 2), (err) => {
        if (err) {
            console.error('Error clearing cart:', err);
            return res.status(500).json({ message: 'Failed to clear cart' });
        }
        res.json({ message: 'All items have been deleted from the cart' });
    });
});

// add new order in the orders table
app.post('/new-order', (req, res) => {
    const {
        orderID,
        customerID,
        delivery,
        employeeID,
        
        paymentMethod,
       
    } = req.body;

    const query = `
        INSERT INTO orders (orderID, CustomerID, date, Delivery, EmployeeID, OrderPaymentMeth )
        VALUES (?, ?, NOW(), ?, ?, ?)
    `;

    db.query(query, [orderID, customerID, delivery, employeeID, paymentMethod,], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Failed to add order to the database');
        }

        res.json({ message: 'Order has been placed successfully' });
    });
});



app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
