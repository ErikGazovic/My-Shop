WELCOME TO MY E-SHOP CALLED DAYHYPE

CODE EDITOR - VS CODE
FRONTEND - HTML, Javascript, CSS, DOM
BACKEND - Node.js, Express.js, PostgreSQL

Website functionality is dynamic fully responsive (except one page).
95% of website is functional (Registration, log in, forgetting password, 'remember me' sessions, real life email notifications) everything is working.
Only few links don't work.

TO SET UP THE WEBSITE

1. download zip file and extract it
2. open new terminal and write npm install to import all dependecies
3. create your PostgreSQL database and create 5 tables
4. create brand-images and product-images folder on your desktop, after adding all images add these folders into project images folder and replace existing folders
5. change variables in DATABASE CONNECTION SET UP (password, port, name of database, host, user)
6. Open new terminal again and type 'nodemon index.js' 
7. Go to your browser and type 'http://localhost:3000/home-page' in your search bar

!!! IMPORTANT !!!
Website is designed to replicate real life e-shop administration. Meaning you have to manually add products.
For that you have to register as ADMIN. 
Registration data as Admin: username - Admin01
After registration and login as admin, hover on My Account in navbar and go to Add Products.
Upload images from previously added folders fill all inputs and click Add to database.
Products will show up based on what category, type, group you selected (example -> group: women, category: clothing, type: dress).

Hopefully everything should work.
PS: Sorry for that mess in style.css file :D

CODE FOR PostgresSQL

PRODUCTS:
CREATE TABLE products (
	id SERIAL PRIMARY KEY,
	image VARCHAR(100),
	product_name VARCHAR(50),
	target_group VARCHAR(10),
	category VARCHAR(20),
	product_type VARCHAR(20),
	brand_logo VARCHAR(100),
	brand_name VARCHAR(50),
	price DOUBLE,
	color VARCHAR(15)
)

USERS:
CREATE TABLE users (
	id SERIAL PRIMARY KEY,
	username VARCHAR(20),
	email VARCHAR(50),
	password VARCHAR(100)

)

STORAGE:
CREATE TABLE product_storage (
	storage_id SERIAL PRIMARY KEY,
	XXS INTEGER,
	XS INTEGER,
	S INTEGER,
	M INTEGER,
	L INTEGER,
	XL INTEGER,
	XXL INTEGER,
	size27 INTEGER,
	size28 INTEGER,
	size29 INTEGER,
	size30 INTEGER,
	size31 INTEGER,
	size32 INTEGER,
	size33 INTEGER,
	size34 INTEGER,
	size35 INTEGER,
	size36 INTEGER,
	size37 INTEGER,
	size38 INTEGER,
	size39 INTEGER,
	size40 INTEGER,
	size41 INTEGER,
	size42 INTEGER,
	size43 INTEGER,
	size44 INTEGER,
	size45 INTEGER,
	size46 INTEGER,
	size47 INTEGER,
	product_id INT,
	CONSTRAINT fk_products FOREIGN KEY (product_id)
    REFERENCES products(product_id)
)


BRANDS:
CREATE TABLE brands (
	id SERIAL PRIMARY KEY,
	brand_name VARCHAR(50),
	brand_logo VARCHAR(100)
)

CART:
CREATE TABLE cart (
	cart_id SERIAL PRIMARY KEY,
	product_id INT REFERENCES products(product_id),
	user_id INT REFERENCES users(user_id),
	size VARCHAR(2)
)


ORDERS:
CREATE TABLE orders (
	order_id SERIAL PRIMARY KEY,
	user_id INTEGER,
	order_price float,
	CONSTRAINT fk_users FOREIGN KEY (user_id)
  REFERENCES users(user_id)
)

