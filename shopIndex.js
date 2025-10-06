import express from "express";
import bodyParser from "body-parser";
import session from "express-session";
import bcrypt from "bcrypt";
import { Strategy } from "passport-local";
import passport from "passport";
import env from "dotenv";
import url from "node:url";
import nodemailer from "nodemailer";

import pkg from 'pg';
env.config();
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "testemailpy321@gmail.com",
        pass: "wuxpspwoworcykop",
    }
    
})

const app = express();
const port = 3000;
const saltRounds = 6;


const year = new Date().getFullYear();


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));


app.use(session({
    secret: process.env.SESSION_SECRET || "defaultsecret",
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24
    },
}));

app.use(passport.initialize());
app.use(passport.session());


// ADD YOUR OWN CREDENCIALS !!! //

//const db = new pg.Client({
//    user: process.env.DB_USER, 
//    host: process.env.DB_HOST,
//    database: process.env.DB_DATABASE,
//    password: process.env.DB_PASSWORD,
//    port: process.env.DB_PORT,
//  });
//
//db.connect();

async function createTables(params) {
    await pool.query(`
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  image VARCHAR(100),
  product_name VARCHAR(50),
  target_group VARCHAR(10),
  category VARCHAR(20),
  product_type VARCHAR(20),
  brand_logo VARCHAR(100),
  brand_name VARCHAR(50),
  price DOUBLE PRECISION,
  color VARCHAR(15)
)
`);

await pool.query(`
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(20),
  email VARCHAR(50),
  password VARCHAR(100)
)
`);

await pool.query(`
CREATE TABLE IF NOT EXISTS product_storage (
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
  CONSTRAINT fk_products FOREIGN KEY (product_id) REFERENCES products(id)
)
`);

await pool.query(`
CREATE TABLE IF NOT EXISTS brands (
  id SERIAL PRIMARY KEY,
  brand_name VARCHAR(50),
  brand_logo VARCHAR(100)
)
`);

await pool.query(`
CREATE TABLE IF NOT EXISTS cart (
  cart_id SERIAL PRIMARY KEY,
  product_id INT,
  user_id INT,
  size VARCHAR(2),
  CONSTRAINT fk_cart_product FOREIGN KEY (product_id) REFERENCES products(id),
  CONSTRAINT fk_cart_user FOREIGN KEY (user_id) REFERENCES users(id)
)
`);

await pool.query(`
CREATE TABLE IF NOT EXISTS orders (
  order_id SERIAL PRIMARY KEY,
  user_id INT,
  order_price FLOAT,
  CONSTRAINT fk_users FOREIGN KEY (user_id) REFERENCES users(id)
)
`);

}

createTables().then(console.log("Tables created!"));

app.get("/home-page", (req, res) => {
    res.render("index.ejs", {year: year});
});

app.get("/home-page/:username", (req, res) => {
    const username = req.params.username;
    res.render("index.ejs", {year: year, username: username});
});

app.get("/about-us", (req, res) => {
    res.render("about-us.ejs", {year: year});
});


app.get("/about-us/:name", (req, res) => {
    const username = req.params.name;
    res.render("about-us.ejs", {year: year, username: username});
});

let allItemsType = ["Jackets", "Hoodies", "T-Shirts", "Jeans", "Pants", "Pyjamas", "Dresses",
    "Boots", "Sneakers", "Trainers", "Slippers", "Slingback", "Hats", "Glasses", "Underwear", "Jewelry", "Handbags",
    "Suits", "Elegant Shoes", "Wallets"];

let menuforWomen = [["Clothing", ["Jackets", "Hoodies", "T-Shirts", "Jeans", "Pants", "Pyjamas", "Dresses"]],
                    ["Shoes", ["Boots", "Sneakers", "Trainers", "Slippers", "Slingback"]],
                    ["Accessories", ["Hats", "Glasses", "Underwear", "Jewelry", "Handbags"]]];

let menuforMen = [["Clothing", ["Jackets", "Hoodies", "T-Shirts", "Jeans", "Pants", "Pyjamas", "Suits"]],
                    ["Shoes", ["Boots", "Sneakers", "Trainers", "Slippers", "Elegant Shoes"]],
                    ["Accessories", ["Hats", "Glasses", "Underwear", "Jewelry", "Wallets"]]];

let menuforGirls = [["Clothing", ["Jackets", "Hoodies", "T-Shirts", "Jeans", "Pants", "Pyjamas", "Dresses"]],
                    ["Shoes", ["Boots", "Sneakers", "Trainers", "Slippers", "Slingback"]],
                    ["Accessories", ["Hats", "Glasses", "Underwear", "Jewelry"]]];

let menuforBoys = [["Clothing", ["Jackets", "Hoodies", "T-Shirts", "Jeans", "Pants", "Pyjamas"]],
                    ["Shoes", ["Boots", "Sneakers", "Trainers", "Slippers", "Elegant Shoes"]],
                    ["Accessories", ["Hats", "Glasses", "Underwear", "Jewelry"]]];

let menuforUnisex = [["Clothing", ["Jackets", "Hoodies", "T-Shirts", "Pants", "Pyjamas"]],
                    ["Shoes", ["Boots", "Sneakers", "Trainers", "Slippers"]],
                    ["Accessories", ["Hats", "Glasses", "Jewelry"]]];


app.get("/filter/targetGroup=:group&category=:category&type=:type", async (req, res) => {
    const group = req.params.group;
    let loggedIn = false;
    let listToSelect;

    switch (group) {
        case "Women": listToSelect = menuforWomen; break;
        case "Men": listToSelect = menuforMen; break;
        case "Girls": listToSelect = menuforGirls; break;
        case "Boys": listToSelect = menuforBoys; break;
        case "Unisex": listToSelect = menuforUnisex; break;
        default: break;
    };

        const category = req.params.category;
    const type = req.params.type;

    let allColors = await getFilterCriteria(group, category, type, "color");
    let a = await getFilterCriteria(group, category, type, "product_name");
    let allBrands = await getFilterCriteria(group, category, type, "brand_name");




    let correspondingProductsNames;
    let colors = [];
    let multiple = [];
    for (var i = 0; i < a.length; i++) {
        let newName = a[i];
        correspondingProductsNames = await pool.query("SELECT * FROM products WHERE target_group = $1 AND category = $2 AND product_type = $3 AND product_name = $4", [group, category, type, newName]);
        
        if (correspondingProductsNames.rowCount > 0) {
            for (let x of correspondingProductsNames.rows) {
                if (correspondingProductsNames.rows.length > 1) {
                    
                    multiple.push(x.color.toLowerCase()); 
                    if (multiple.length === correspondingProductsNames.rowCount) {
                            colors.push([newName, multiple]);
                        
                        multiple = [];
                    }
                    
                } else {

                    colors.push([newName, [x.color.toLowerCase()]]);
                }
            }

        }

    }

    let correspondingProducts = await pool.query("SELECT * FROM products WHERE target_group = $1 AND category = $2 AND product_type = $3", [group, category, type]);

    res.render("products.ejs", {loggedIn: loggedIn, allBrands: allBrands, allColors: allColors, year: year, group: group, menu: listToSelect, category: category, type: type, correspondingProducts: correspondingProducts.rows, colors: colors});
});

app.get("/:name/filter/targetGroup=:group&category=:category&type=:type", async (req, res) => {
    const username = req.params.name;
    const group = req.params.group;

    let listToSelect;

    switch (group) {
        case "Women": listToSelect = menuforWomen; break;
        case "Men": listToSelect = menuforMen; break;
        case "Girls": listToSelect = menuforGirls; break;
        case "Boys": listToSelect = menuforBoys; break;
        case "Unisex": listToSelect = menuforUnisex; break;
        default: break;
    };

    const category = req.params.category;
    const type = req.params.type;

    let allColors = await getFilterCriteria(group, category, type, "color");
    let a = await getFilterCriteria(group, category, type, "product_name");
    let allBrands = await getFilterCriteria(group, category, type, "brand_name");

    let correspondingProductsNames;
    let colors = [];
    let multiple = [];
    for (var i = 0; i < a.length; i++) {
        let newName = a[i];
        correspondingProductsNames = await pool.query("SELECT * FROM products WHERE target_group = $1 AND category = $2 AND product_type = $3 AND product_name = $4", [group, category, type, newName]);
        
        if (correspondingProductsNames.rowCount > 0) {
            for (let x of correspondingProductsNames.rows) {
                if (correspondingProductsNames.rows.length > 1) {
                    
                    multiple.push(x.color.toLowerCase()); 
                    if (multiple.length === correspondingProductsNames.rowCount) {
                            colors.push([newName, multiple]);
                        
                        multiple = [];
                    }
                    
                } else {

                    colors.push([newName, [x.color.toLowerCase()]]);
                }
            }

        }

    }
    let correspondingProducts = await pool.query("SELECT * FROM products WHERE target_group = $1 AND category = $2 AND product_type = $3", [group, category, type]);


    res.render("products.ejs", {allBrands: allBrands, allColors: allColors, year: year, username: username, group: group, menu: listToSelect, category: category, type: type, correspondingProducts: correspondingProducts.rows, colors: colors});
});

app.get("/:name/filter/targetGroup=:group&category=:category&type=:type/id=:id", async (req, res) => {
    const username = req.params.name;
    const message = req.query.success;
    req.query.succes = null;
    const group = req.params.group;
    const id = req.params.id;
    const category = req.params.category;
    const type = req.params.type;
    let listToSelect;

    switch (group) {
        case "Women": listToSelect = menuforWomen; break;
        case "Men": listToSelect = menuforMen; break;
        case "Girls": listToSelect = menuforGirls; break;
        case "Boys": listToSelect = menuforBoys; break;
        case "Unisex": listToSelect = menuforUnisex; break;
        default: break;
    };



    let allColors = await getFilterCriteria(group, category, type, "color");
    let a = await getFilterCriteria(group, category, type, "product_name");
    let allBrands = await getFilterCriteria(group, category, type, "brand_name");


    let correspondingProductsNames;
    let imagesAndIDsAndNames = [];
    for (var i = 0; i < a.length; i++) {
        let newName = a[i];
        correspondingProductsNames = await pool.query("SELECT * FROM products WHERE target_group = $1 AND category = $2 AND product_type = $3 AND product_name = $4", [group, category, type, newName]);
        if (correspondingProductsNames.rowCount > 0) {
            for ( let correspondingProduct of correspondingProductsNames.rows ) {
                    imagesAndIDsAndNames.push([newName, [correspondingProduct.image, correspondingProduct["product_id"]]]);
            }
        }
    }
    let correspondingProductsNames2;
    let colors = [];
    let multiple = [];
    for (var i = 0; i < a.length; i++) {
        let newName = a[i];
        correspondingProductsNames2 = await pool.query("SELECT * FROM products WHERE target_group = $1 AND category = $2 AND product_type = $3 AND product_name = $4", [group, category, type, newName]);
        
        if (correspondingProductsNames2.rowCount > 0) {
            for (let x of correspondingProductsNames2.rows) {
                if (correspondingProductsNames2.rows.length > 1) {
                    
                    multiple.push(x.color.toLowerCase()); 
                    if (multiple.length === correspondingProductsNames2.rowCount) {
                            colors.push([newName, multiple]);
                        
                        multiple = [];
                    }
                    
                } else {

                    colors.push([newName, [x.color.toLowerCase()]]);
                }
            }

        }

    }
        

    const correspondingProducts = await pool.query("SELECT * FROM products WHERE target_group = $1 AND category = $2 AND product_type = $3", [group, category, type]);
    const clickedItem = await pool.query(`SELECT * FROM products WHERE product_id = ${id}`);
    res.render("products.ejs", {message: message, allBrands: allBrands, allColors: allColors, year: year, username: username, group: group, menu: listToSelect, category: category, type: type, id: id, clickedItem: clickedItem.rows[0], correspondingProducts: correspondingProducts.rows, imagesAndIDsAndNames: imagesAndIDsAndNames, colors: colors});
});


app.get("/filter/targetGroup=:group&category=:category&type=:type/id=:id", async (req, res) => {


    const group = req.params.group;
    const id = req.params.id;
    const category = req.params.category;
    const type = req.params.type;
    let listToSelect;

    switch (group) {
        case "Women": listToSelect = menuforWomen; break;
        case "Men": listToSelect = menuforMen; break;
        case "Girls": listToSelect = menuforGirls; break;
        case "Boys": listToSelect = menuforBoys; break;
        case "Unisex": listToSelect = menuforUnisex; break;
        default: break;
    };

    let allColors = await getFilterCriteria(group, category, type, "color");
    let a = await getFilterCriteria(group, category, type, "product_name");
    let allBrands = await getFilterCriteria(group, category, type, "brand_name");

    let correspondingProductsNames;
    let imagesAndIDsAndNames = [];
    for (var i = 0; i < a.length; i++) {
        let newName = a[i];
        correspondingProductsNames = await pool.query("SELECT * FROM products WHERE target_group = $1 AND category = $2 AND product_type = $3 AND product_name = $4", [group, category, type, newName]);
        if (correspondingProductsNames.rowCount > 0) {
            for ( let correspondingProduct of correspondingProductsNames.rows ) {
                    imagesAndIDsAndNames.push([newName, [correspondingProduct.image, correspondingProduct["product_id"]]]);
            }
        }

        
    }
    

    let correspondingProductsNames2;
    let colors = [];
    let multiple = [];
    for (var i = 0; i < a.length; i++) {
        let newName = a[i];
        correspondingProductsNames2 = await pool.query("SELECT * FROM products WHERE target_group = $1 AND category = $2 AND product_type = $3 AND product_name = $4", [group, category, type, newName]);
        
        if (correspondingProductsNames2.rowCount > 0) {
            for (let x of correspondingProductsNames2.rows) {
                if (correspondingProductsNames2.rows.length > 1) {
                    
                    multiple.push(x.color.toLowerCase()); 
                    if (multiple.length === correspondingProductsNames2.rowCount) {
                            colors.push([newName, multiple]);
                        
                        multiple = [];
                    }
                    
                } else {

                    colors.push([newName, [x.color.toLowerCase()]]);
                }
            }

        }

    }

    const correspondingProducts = await pool.query("SELECT * FROM products WHERE target_group = $1 AND category = $2 AND product_type = $3", [group, category, type]);

    const clickedItem = await pool.query(`SELECT * FROM products WHERE product_id = ${id}`);
    res.render("products.ejs", { allBrands: allBrands, allColors: allColors, year: year, group: group, menu: listToSelect, category: category, type: type, id: id, clickedItem: clickedItem.rows[0], correspondingProducts: correspondingProducts.rows, imagesAndIDsAndNames: imagesAndIDsAndNames, colors: colors});
});

app.post("/filter/targetGroup=:group&category=:category&type=:type&filtered-products", async (req, res) => {
    const brand = req.body["filter-brand"];
    const colorLowerCase = req.body["filter-color"];
    const color = String(colorLowerCase).charAt(0).toUpperCase() + String(colorLowerCase).slice(1);
    const price = req.body["vol"];
    const size = req.body["filter-size"].toLowerCase();

    
    const group = req.params.group;

    let listToSelect;

    switch (group) {
        case "Women": listToSelect = menuforWomen; break;
        case "Men": listToSelect = menuforMen; break;
        case "Girls": listToSelect = menuforGirls; break;
        case "Boys": listToSelect = menuforBoys; break;
        case "Unisex": listToSelect = menuforUnisex; break;
        default: break;
    };

    const category = req.params.category;
    const type = req.params.type;

    let allColors = await getFilterCriteria(group, category, type, "color");
    let a = await getFilterCriteria(group, category, type, "product_name");
    let allBrands = await getFilterCriteria(group, category, type, "brand_name");

    let correspondingProductsNames;
    let colors = [];
    let multiple = [];
    for (var i = 0; i < a.length; i++) {
        let newName = a[i];
        correspondingProductsNames = await pool.query("SELECT * FROM products WHERE target_group = $1 AND category = $2 AND product_type = $3 AND product_name = $4", [group, category, type, newName]);
        
        if (correspondingProductsNames.rowCount > 0) {
            for (let x of correspondingProductsNames.rows) {
                if (correspondingProductsNames.rows.length > 1) {
                    
                    multiple.push(x.color.toLowerCase()); 
                    if (multiple.length === correspondingProductsNames.rowCount) {
                            colors.push([newName, multiple]);
                        
                        multiple = [];
                    }
                    
                } else {

                    colors.push([newName, [x.color.toLowerCase()]]);
                }
            }

        }

    }
    let correspondingProducts = await pool.query("SELECT * FROM products JOIN product_storage ON products.product_id = product_storage.product_id WHERE target_group = $1 AND category = $2 AND product_type = $3", [group, category, type]);
    if (brand && color && price && size) {
        
        correspondingProducts = await pool.query(`SELECT * FROM products JOIN product_storage ON products.product_id = product_storage.product_id WHERE target_group = $1 AND category = $2 AND product_type = $3 AND brand_name = $4 AND color = $5 AND price <= $6 AND ${size} > 0`, [group, category, type, brand, color, price]);
    } else if (brand && color && price && !size) {
        correspondingProducts = await pool.query(`SELECT * FROM products JOIN product_storage ON products.product_id = product_storage.product_id WHERE target_group = $1 AND category = $2 AND product_type = $3 AND brand_name = $4 AND color = $5 AND price <= $6`, [group, category, type, brand, color, price]);
    } else if (brand && color && !price && size) {
        correspondingProducts = await pool.query(`SELECT * FROM products JOIN product_storage ON products.product_id = product_storage.product_id WHERE target_group = $1 AND category = $2 AND product_type = $3 AND brand_name = $4 AND color = $5 AND ${size} > 0`, [group, category, type, brand, color]);
    } else if (brand && !color && price && size) {
        correspondingProducts = await pool.query(`SELECT * FROM products JOIN product_storage ON products.product_id = product_storage.product_id WHERE target_group = $1 AND category = $2 AND product_type = $3 AND brand_name = $4 AND price <= $5 AND ${size} > 0`, [group, category, type, brand, price]);
    } else if (!brand && color && price && size) {
        correspondingProducts = await pool.query(`SELECT * FROM products JOIN product_storage ON products.product_id = product_storage.product_id WHERE target_group = $1 AND category = $2 AND product_type = $3 AND color = $4 AND price <= $5 AND ${size} > 0`, [group, category, type, color, price]);
    } else if (brand && color && !price && !size) {
        correspondingProducts = await pool.query(`SELECT * FROM products JOIN product_storage ON products.product_id = product_storage.product_id WHERE target_group = $1 AND category = $2 AND product_type = $3 AND brand_name = $4 AND color = $5`, [group, category, type, brand, color]);
    } else if (brand && !color && !price && size) {
        correspondingProducts = await pool.query(`SELECT * FROM products JOIN product_storage ON products.product_id = product_storage.product_id WHERE target_group = $1 AND category = $2 AND product_type = $3 AND brand_name = $4 AND ${size} > 0`, [group, category, type, brand]);
    } else if (!brand && !color && price && size) {
        correspondingProducts = await pool.query(`SELECT * FROM products JOIN product_storage ON products.product_id = product_storage.product_id WHERE target_group = $1 AND category = $2 AND product_type = $3 AND price <= $5 AND ${size} > 0`, [group, category, type, price]);
    } else if (brand && !color && price && !size) {
        correspondingProducts = await pool.query(`SELECT * FROM products JOIN product_storage ON products.product_id = product_storage.product_id WHERE target_group = $1 AND category = $2 AND product_type = $3 AND brand_name = $4 AND price <= $5`, [group, category, type, brand, price]);
    } else if (!brand && color && !price && size) {
        correspondingProducts = await pool.query(`SELECT * FROM products JOIN product_storage ON products.product_id = product_storage.product_id WHERE target_group = $1 AND category = $2 AND product_type = $3 AND ${size} > 0 AND color = $4`, [group, category, type, color]);
    } else if (!brand && color && price && !size) {
        correspondingProducts = await pool.query(`SELECT * FROM products JOIN product_storage ON products.product_id = product_storage.product_id WHERE target_group = $1 AND category = $2 AND product_type = $3 AND price <= $4 AND color = $5`, [group, category, type, price, color]);
    } else if (!brand && !color && !price && size) {
        correspondingProducts = await pool.query(`SELECT * FROM products JOIN product_storage ON products.product_id = product_storage.product_id WHERE target_group = $1 AND category = $2 AND product_type = $3 AND ${size} > 0`, [group, category, type]);
    } else if (brand && !color && !price && !size) {
        correspondingProducts = await pool.query(`SELECT * FROM products JOIN product_storage ON products.product_id = product_storage.product_id WHERE target_group = $1 AND category = $2 AND product_type = $3 AND brand_name <= $4`, [group, category, type, brand]);
    } else if (!brand && color && !price && !size) {
        correspondingProducts = await pool.query(`SELECT * FROM products JOIN product_storage ON products.product_id = product_storage.product_id WHERE target_group = $1 AND category = $2 AND product_type = $3 AND color = $4`, [group, category, type, color]);
    } else if (!brand && !color && price && !size) {
        correspondingProducts = await pool.query(`SELECT * FROM products JOIN product_storage ON products.product_id = product_storage.product_id WHERE target_group = $1 AND category = $2 AND product_type = $3 AND price <= $4`, [group, category, type, price]);
    } else {
        correspondingProducts = await pool.query("SELECT * FROM products JOIN product_storage ON products.product_id = product_storage.product_id WHERE target_group = $1 AND category = $2 AND product_type = $3", [group, category, type]);
    }
    
    



    res.render("products.ejs", {allBrands: allBrands, allColors: allColors, year: year, group: group, menu: listToSelect, category: category, type: type, correspondingProducts: correspondingProducts.rows, colors: colors});
})

app.post("/:name/filter/targetGroup=:group&category=:category&type=:type&filtered-products", async (req, res) => {
    const brand = req.body["filter-brand"];
    const colorLowerCase = req.body["filter-color"];
    const color = String(colorLowerCase).charAt(0).toUpperCase() + String(colorLowerCase).slice(1);
    const price = req.body["vol"];
    const size = req.body["filter-size"].toLowerCase();

    const username = req.params.username;
    const loggedIn = true;
    
    const group = req.params.group;

    let listToSelect;

    switch (group) {
        case "Women": listToSelect = menuforWomen; break;
        case "Men": listToSelect = menuforMen; break;
        case "Girls": listToSelect = menuforGirls; break;
        case "Boys": listToSelect = menuforBoys; break;
        case "Unisex": listToSelect = menuforUnisex; break;
        default: break;
    };

    const category = req.params.category;
    const type = req.params.type;
    let allColors = await getFilterCriteria(group, category, type, "color");
    let a = await getFilterCriteria(group, category, type, "product_name");
    let allBrands = await getFilterCriteria(group, category, type, "brand_name");

    let correspondingProductsNames;
    let colors = [];
    let multiple = [];
    for (var i = 0; i < a.length; i++) {
        let newName = a[i];
        correspondingProductsNames = await pool.query("SELECT * FROM products WHERE target_group = $1 AND category = $2 AND product_type = $3 AND product_name = $4", [group, category, type, newName]);
        
        if (correspondingProductsNames.rowCount > 0) {
            for (let x of correspondingProductsNames.rows) {
                if (correspondingProductsNames.rows.length > 1) {
                    
                    multiple.push(x.color.toLowerCase()); 
                    if (multiple.length === correspondingProductsNames.rowCount) {
                            colors.push([newName, multiple]);
                        
                        multiple = [];
                    }
                    
                } else {

                    colors.push([newName, [x.color.toLowerCase()]]);
                }
            }

        }

    }

    let correspondingProducts = await pool.query("SELECT * FROM products JOIN product_storage ON products.product_id = product_storage.product_id WHERE target_group = $1 AND category = $2 AND product_type = $3", [group, category, type]);
    if (brand && color && price && size) {
   
        correspondingProducts = await pool.query(`SELECT * FROM products JOIN product_storage ON products.product_id = product_storage.product_id WHERE target_group = $1 AND category = $2 AND product_type = $3 AND brand_name = $4 AND color = $5 AND price <= $6 AND ${size} > 0`, [group, category, type, brand, color, price]);
    } else if (brand && color && price && !size) {
;
        correspondingProducts = await pool.query(`SELECT * FROM products JOIN product_storage ON products.product_id = product_storage.product_id WHERE target_group = $1 AND category = $2 AND product_type = $3 AND brand_name = $4 AND color = $5 AND price <= $6`, [group, category, type, brand, color, price]);
    } else if (brand && color && !price && size) {

        correspondingProducts = await pool.query(`SELECT * FROM products JOIN product_storage ON products.product_id = product_storage.product_id WHERE target_group = $1 AND category = $2 AND product_type = $3 AND brand_name = $4 AND color = $5 AND ${size} > 0`, [group, category, type, brand, color]);
    } else if (brand && !color && price && size) {

        correspondingProducts = await pool.query(`SELECT * FROM products JOIN product_storage ON products.product_id = product_storage.product_id WHERE target_group = $1 AND category = $2 AND product_type = $3 AND brand_name = $4 AND price <= $5 AND ${size} > 0`, [group, category, type, brand, price]);
    } else if (!brand && color && price && size) {
   
        correspondingProducts = await pool.query(`SELECT * FROM products JOIN product_storage ON products.product_id = product_storage.product_id WHERE target_group = $1 AND category = $2 AND product_type = $3 AND color = $4 AND price <= $5 AND ${size} > 0`, [group, category, type, color, price]);
    } else if (brand && color && !price && !size) {

        correspondingProducts = await pool.query(`SELECT * FROM products JOIN product_storage ON products.product_id = product_storage.product_id WHERE target_group = $1 AND category = $2 AND product_type = $3 AND brand_name = $4 AND color = $5`, [group, category, type, brand, color]);
    } else if (brand && !color && !price && size) {
   
        correspondingProducts = await pool.query(`SELECT * FROM products JOIN product_storage ON products.product_id = product_storage.product_id WHERE target_group = $1 AND category = $2 AND product_type = $3 AND brand_name = $4 AND ${size} > 0`, [group, category, type, brand]);
    } else if (!brand && !color && price && size) {
    
        correspondingProducts = await pool.query(`SELECT * FROM products JOIN product_storage ON products.product_id = product_storage.product_id WHERE target_group = $1 AND category = $2 AND product_type = $3 AND price <= $5 AND ${size} > 0`, [group, category, type, price]);
    } else if (brand && !color && price && !size) {
   
        correspondingProducts = await pool.query(`SELECT * FROM products JOIN product_storage ON products.product_id = product_storage.product_id WHERE target_group = $1 AND category = $2 AND product_type = $3 AND brand_name = $4 AND price <= $5`, [group, category, type, brand, price]);
    } else if (!brand && color && !price && size) {
   
        correspondingProducts = await pool.query(`SELECT * FROM products JOIN product_storage ON products.product_id = product_storage.product_id WHERE target_group = $1 AND category = $2 AND product_type = $3 AND ${size} > 0 AND color = $4`, [group, category, type, color]);
    } else if (!brand && color && price && !size) {
   
        correspondingProducts = await pool.query(`SELECT * FROM products JOIN product_storage ON products.product_id = product_storage.product_id WHERE target_group = $1 AND category = $2 AND product_type = $3 AND price <= $4 AND color = $5`, [group, category, type, price, color]);
    } else if (!brand && !color && !price && size) {

        correspondingProducts = await pool.query(`SELECT * FROM products JOIN product_storage ON products.product_id = product_storage.product_id WHERE target_group = $1 AND category = $2 AND product_type = $3 AND ${size} > 0`, [group, category, type]);
    } else if (brand && !color && !price && !size) {
 
        correspondingProducts = await pool.query(`SELECT * FROM products JOIN product_storage ON products.product_id = product_storage.product_id WHERE target_group = $1 AND category = $2 AND product_type = $3 AND brand_name <= $4`, [group, category, type, brand]);
    } else if (!brand && color && !price && !size) {
    
        correspondingProducts = await pool.query(`SELECT * FROM products JOIN product_storage ON products.product_id = product_storage.product_id WHERE target_group = $1 AND category = $2 AND product_type = $3 AND color = $4`, [group, category, type, color]);
    } else if (!brand && !color && price && !size) {
   
        correspondingProducts = await pool.query(`SELECT * FROM products JOIN product_storage ON products.product_id = product_storage.product_id WHERE target_group = $1 AND category = $2 AND product_type = $3 AND price <= $4`, [group, category, type, price]);
    } else {
 
        correspondingProducts = await pool.query("SELECT * FROM products JOIN product_storage ON products.product_id = product_storage.product_id WHERE target_group = $1 AND category = $2 AND product_type = $3", [group, category, type]);
    }


    res.render("products.ejs", {loggedIn: loggedIn, username: username, allBrands: allBrands, allColors: allColors, year: year, group: group, menu: listToSelect, category: category, type: type, correspondingProducts: correspondingProducts.rows, colors: colors});
});


app.post("/:name/add-to-cart&id=:id", async (req, res) => {
    const size = req.body["product-size"];
    const id = parseInt(req.params.id);
    const username = req.params.name;
    const group = req.body["product-group"];
    const type = req.body["product-type"];
    const category = req.body["product-category"];

    const userIDRaw = await pool.query("SELECT user_id FROM users WHERE username = $1", [username]);
    const userID = userIDRaw.rows[0]["user_id"];
    await pool.query("INSERT INTO cart (product_id, user_id, size) VALUES ($1, $2, $3)", [id, userID, size]);

    var successMsg = encodeURIComponent("Product was added to your cart");
    res.redirect(url.format({pathname: `/${username}/filter/targetGroup=${group}&category=${category}&type=${type}/id=${id}`,
            query: {
            "success" : successMsg
            }
        }));
});

app.get("/:name/my-cart", async (req, res) => {
    const username = req.params.name;
    const loggedIn = true;
    const userIDRaw = await pool.query("SELECT user_id FROM users WHERE username = $1", [req.params.name]);
    const userID = userIDRaw.rows[0]["user_id"];
    const sizesRaw = await pool.query("SELECT size FROM cart WHERE user_id = $1", [userID]);
    const myItemsIdsRaw = await pool.query("SELECT product_id FROM cart WHERE user_id = $1", [userID]);
    const myItemsIds = [];
    for (let id of myItemsIdsRaw.rows) {
        myItemsIds.push(id["product_id"]);
    }
    let allItemsInCart;
    let itemsList = []
    for (let itemId of myItemsIds) {
        allItemsInCart = await pool.query("SELECT * FROM products WHERE product_id = $1", [itemId]);
        itemsList.push(allItemsInCart.rows[0]);
    }
    let itemsSizes = [];

    for (let size of sizesRaw.rows) {
        itemsSizes.push(size["size"]);
    }

    res.render("user-cart.ejs", {itemsSizes: itemsSizes, itemsList: itemsList, year: year, loggedIn: loggedIn, username: username});
});

app.post("/:name/purchase", async (req, res) => {
    const userIDRaw = await db.query("SELECT user_id FROM users WHERE username = $1", [req.params.name]);
    const userID = userIDRaw.rows[0]["user_id"];

    await pool.query("INSERT INTO orders (user_id, order_price) VALUES ($1, $2)", [userID, req.body["total-price"]]);
    await pool.query("DELETE FROM cart WHERE user_id = $1", [userID]);


    const orderIDRaw = await pool.query("SELECT order_id FROM orders WHERE user_id = $1", [userID]);
    const orderID = orderIDRaw.rows[0]["order_id"];


    const emailRaw = await pool.query("SELECT email FROM users WHERE user_id = $1", [userID]);
    const email = emailRaw.rows[0]["email"];
    const emailMessage = `Order successful! Order id: ${orderID}, name of user: ${req.params.name}\n, total: ${req.body["total-price"]}` +
    "Thank you for trying my website <3\n" + 
    "\n" +
    "\n" +
    "Website creator - Erik Gažovič";


    const recipient = `${req.params.name} <${email}>`;
 
    await transport.sendMail({
        from: "no-reply@example.com",
        to: recipient,
        subject: "THANK YOU FOR YOUR ORDER!",
        text: emailMessage,
        html: emailMessage,
    });



    res.redirect(url.format({
        pathname: "/thank-you",
        query: {
            "valid": req.params.name,
            "year": year
        }
    }));
    
});


app.get("/thank-you", (req, res) => {
    const username = req.query.valid;
    const year = req.query.year;
    req.params.valid = null;
    res.render("thank-you.ejs", {year: year, username: username});
});

app.post("/delete", async (req, res) => {
    const productToDeleteID = req.body["product-id"];
    const productToDeleteSIZE = req.body["product-size"];
    const username = req.body.username;
    await db.query("DELETE FROM cart WHERE cart_id IN (SELECT cart_id FROM cart WHERE product_id = $1 AND size = $2 LIMIT 1)", [productToDeleteID, productToDeleteSIZE]);
    res.redirect(`/${username}/my-cart`);
});


app.get("/forgot-pass", (req, res) => {
    const valid = req.query.valid;
    const name = req.query.name;
    const passwordMessage = req.query.match;
    let verified;
    if (req.query.verified !== undefined) {
        verified = req.query.verified;
    }

    res.render("forgot-pass.ejs", {year: year, valid: valid, verified: verified, name: name, passwordMessage: passwordMessage});
});

var verificationCode = '';
var list = [];
function createCode () {
    
        for (var i = 0; i < 6; i++) {
            let randomNum = Math.floor(Math.random() * 10).toString();
        verificationCode += randomNum;
    }

    list.push(verificationCode);
}


app.post("/send-verification", async (req, res) => {
    const mailInput = req.body.email;
    list = []
    verificationCode = '';
    createCode();

    const emailRaw = await pool.query("SELECT * FROM users WHERE email = $1", [mailInput]);
    if (emailRaw.rowCount < 1) {
        res.redirect(url.format({
            pathname: "/forgot-pass",
            query: {
                "valid": false
            }
        }));        
    } else {
        const email = emailRaw.rows[0]["email"];
        const name = emailRaw.rows[0]["username"];

        let emailMessage = "Your verification code is: " + verificationCode;


        const recipient = `${name} <${email}>`; 
        await transport.sendMail({
            from: "no-reply@example.com",
            to: recipient,
            subject: "Your verification code",
            text: emailMessage,
            html: emailMessage,
        });

        res.redirect(url.format({
            pathname: "/forgot-pass",
            query: {
                "valid": true,
                "name": name
            }
        }));
    }

})

app.post("/verify", async (req, res) => {
    let codeInput = '';
    for (var i = 1; i <= 6; i++) {
        codeInput += req.body["num" + i];
    }
    if (codeInput === list[0]) {
        
        res.redirect(url.format({
            pathname: "/forgot-pass",
            query: {
                "verified": true,
                "name": req.body.name,
            }
        }));
    } else {
        res.redirect(url.format({
            pathname: "/forgot-pass",
            query: {
                "verified": false,
                "name": req.body.name,
            }
        }));
    }
})

app.post("/reset-password", async (req, res) => {
    const password = req.body.password;
    const repPassword = req.body["rep-password"];
    let passwordMessage = "";
    const username = req.body.name;
    

   
  try {
    if (checkRegisterPassword(password, repPassword)[0] == false) {
        passwordMessage = checkRegisterPassword(password, repPassword)[1];
        res.redirect(url.format({
            pathname: "/forgot-pass",
            query: {
                "verified": true,
                "match": passwordMessage
            }
        }));
    }
    
    else {
        bcrypt.hash(password, saltRounds, async (err, hash) => {
            if (err) {
                res.send(err);
            } else {
                console.log(password);
                const result = await pool.query(
                    "UPDATE users  SET password = $1 WHERE username = $2 RETURNING *", 
                    [ hash, username]
                );
                setTimeout(() => {
                    const user = result.rows[0];
                    
                    req.login(user, (err) => {
                            res.redirect(url.format({
                                pathname: `/login`,
                                query: {
                                    "success": "Password has been updated"
                                }
                            }));
                        
                    }, 1000)});      
                }
            })
        }
    } catch (err) {
        console.log(err);
      }    
})

app.get("/add-product/admin=:admin", (req, res) => {
    const username = req.params.admin;
    res.render("add-product.ejs", {year: year, allClothes: allItemsType, username: username});
});

app.post("/add-product", async (req, res) => {
    const username = req.body.username;
    let brandImageExists;
    let product;
    if (req.body.brandLogo !== "") {
        brandImageExists = true;
        product = {
        productImg : req.body.img,
        productName : req.body.productName,
        productTargetGroup : req.body.targetGroup,
        productCategory : req.body.productCategory,
        prdouctType : req.body.productType,
        productLogoImg : req.body.brandLogo,
        productBrandName : req.body.brandName,
        prodcutPrice : parseFloat(req.body.setPrice),
        productColor : req.body.setColor,
    }
    } else {
        brandImageExists = false;
        product = {
        productImg : req.body.img,
        productName : req.body.productName,
        productTargetGroup : req.body.targetGroup,
        productCategory : req.body.productCategory,
        prdouctType : req.body.productType,
        productBrandName : req.body.brandName,
        prodcutPrice : parseFloat(req.body.setPrice),
        productColor : req.body.setColor,
    } 
    }
    let productSizes;
    if (req.body.productCategory == "Clothing" || req.body.productCategory == "Accessories") {
        productSizes = [parseInt(req.body.xxsAmount), parseInt(req.body.xsAmount), parseInt(req.body.sAmount), parseInt(req.body.mAmount), parseInt(req.body.lAmount), parseInt(req.body.xlAmount), parseInt(req.body.xxlAmount)];
    }
    if (req.body.productCategory == "Shoes") {
        productSizes = [];

        for (var i = 27; i <= 47; i++) {
            productSizes.push(parseInt(req.body[`size${i}Amount`]));
        }
    }

    try {

        const resultNameColor = await pool.query(`SELECT * FROM products WHERE product_name = '${product.productName}' AND color = '${product.productColor}'`);
        const resultProductImg = await pool.query(`SELECT * FROM products WHERE image = '${product.productImg}'`);
        let failMsg;
      
        if (resultNameColor.rows.length > 0) {
            failMsg = "Name and color of the product already exists in database";
            res.render(`add-product.ejs`, {failMsg: failMsg, allClothes: allItemsType, username: username, year: year});

        } 
        else if (resultProductImg.rows.length > 0) {
            failMsg = "This image already exists in database";
            res.render(`add-product.ejs`, {failMsg: failMsg, allClothes: allItemsType, username: username, year: year});

        } 
        else {
            if (brandImageExists) {
                const brandExists = await pool.query("SELECT * FROM brands WHERE brand_name = $1 OR brand_logo = $2", [product.productBrandName, product.productLogoImg]);
                let brandLogo;
                if (brandExists.rows.length < 1) {
                    await pool.query("INSERT INTO brands (brand_name, brand_logo) VALUES ($1, $2)", [product.productBrandName, product.productLogoImg]);
                } 
                
                brandLogo = await pool.query("SELECT * FROM brands WHERE brand_name = $1", [product.productBrandName]);
                const addProduct = await pool.query("INSERT INTO products (image, product_name, target_group, category, product_type, brand_logo, brand_name, price, color) VALUES" +
                "($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *", [product.productImg, product.productName,
                product.productTargetGroup, product.productCategory, product.prdouctType, brandLogo.rows[0]["brand_logo"], brandLogo.rows[0]["brand_name"], product.prodcutPrice ,product.productColor]);
                productSizes.push(addProduct.rows[0]["product_id"]);
                if (productSizes.length <= 8) {
                    await pool.query("INSERT INTO product_storage (xxs, xs, s, m, l, xl, xxl, size27, size28, size29, size30, size31, size32, size33, size34, size35, size36, size37, size38, size39, size40, size41, size42, size43, size44, size45, size46, size47, product_id) VALUES" + 
                        "($1, $2, $3, $4, $5, $6, $7, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, $8)", productSizes);
                    
                } 
                else if (productSizes.length > 8) {
                    await pool.query("INSERT INTO product_storage (xxs, xs, s, m, l, xl, xxl, size27, size28, size29, size30, size31, size32, size33, size34, size35, size36, size37, size38, size39, size40, size41, size42, size43, size44, size45, size46, size47, product_id) VALUES" + 
                        "(null, null, null, null, null, null, null, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)", productSizes);                    
                }

                res.render(`add-product.ejs`, {successMsg: "Product was added to database", allClothes: allItemsType, username: username, year: year}); 
            } else if (!brandImageExists) {
                const logo = await pool.query("SELECT * FROM brands WHERE brand_name = $1", [product.productBrandName]);

                if (logo.rows.length < 1) {
                    failMsg = "This brand is not in database";
                    res.render(`add-product.ejs`, {failMsg: failMsg, allClothes: allItemsType, username: username, year: year});                
                } 
                else {

                    const addProduct  = await pool.query("INSERT INTO products (image, product_name, target_group, category, product_type, brand_logo, brand_name, price, color) VALUES" +
                    "($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *", [product.productImg, product.productName,
                    product.productTargetGroup, product.productCategory, product.prdouctType, logo.rows[0]["brand_logo"], logo.rows[0]["brand_name"], product.prodcutPrice, product.productColor]);

                    if (productSizes.length <= 8) {
                        productSizes.push(addProduct.rows[0]["product_id"]);
                        await pool.query("INSERT INTO product_storage (xxs, xs, s, m, l, xl, xxl, size27, size28, size29, size30, size31, size32, size33, size34, size35, size36, size37, size38, size39, size40, size41, size42, size43, size44, size45, size46, size47, product_id) VALUES" + 
                        "($1, $2, $3, $4, $5, $6, $7, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, $8)", productSizes);
                    
                    } 
                    else if (productSizes.length > 8) {
                        productSizes.push(addProduct.rows[0]["product_id"]);
                        await pool.query("INSERT INTO product_storage (xxs, xs, s, m, l, xl, xxl, size27, size28, size29, size30, size31, size32, size33, size34, size35, size36, size37, size38, size39, size40, size41, size42, size43, size44, size45, size46, size47, product_id) VALUES" + 
                        "(null, null, null, null, null, null, null, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)", productSizes);                    
                    }
                    res.render(`add-product.ejs`, {successMsg : "Product was added to database", allClothes: allItemsType, username: username, year: year});  
                }
              
            }

        }
    } catch(err) {
        res.send(err);
    }
    
});

app.get("/login", (req, res) => {
    const success = req.query.success;
    req.query.success = null;
    res.render("login.ejs", {year: year, success: success});
});

app.post("/login", (req, res) => {
    passport.authenticate("local",
        (err, user, options) => {
          if (user) {
            const username = user.username;
            req.session.isLoggedIn = true;
            if (req.body.remember === "on") {
                setTimeout(() => {
                    res.redirect(`/home-page/${username}`);
                }, 1000);
            } else {
                req.session.cookie.maxAge = 1000;
                        setTimeout(() => {
                            res.redirect(`/home-page/${username}`);
                        }, 1000);
                    }
        } else {
            if (options.message === "Wrong password") {
                res.render("login.ejs", { passwordMessage: options.message, year: year});
            } else {
                res.render("login.ejs", { message: options.message, year: year});
            };
            
          };
    })(req, res)
  });

passport.use(new Strategy ({usernameField: "username", passwordField: "password"}, async function verify(username, password, cb) {
    try {
        const checkResultUsername = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
        const checkResultEmail = await pool.query("SELECT * FROM users WHERE email = $1", [username]);
        
        if (checkResultUsername.rows.length > 0 || checkResultEmail.rows.length > 0) {
            const user = checkResultUsername.rows[0] || checkResultEmail.rows[0]; 
            const storedHashedPassword = user.password;
            bcrypt.compare(password, storedHashedPassword, (err, result) => {
                if (err) {
                    return cb(err);
                } else {
                    if (result) {
                        return cb(null, user);
                    } else {
                        return cb(null, false, {message : "Wrong password"});
                    }
                }
            })
            
        } else {
            return cb(null, false, {message : "User with this username or email does not exist"});
        }
            
        
      } catch (err) {
        console.log("error");
        return cb(err)
      }
}));


app.get("/logout", (req, res) => {
    req.logout(function (err) {
      if (err) {
        return next(err);
      }
      res.redirect("/home-page");
    });
  });


app.get("/register", (req, res) => {
    res.render("register.ejs",  {year: year});
});

app.get("/register/:name", (req, res) => {
    const username = req.params.name;
    res.render("register.ejs",  {year: year, username: username});
});

app.post("/register", async (req, res) => {
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const repPassword = req.body["rep-password"];
    let passwordMessage = "";
    

   
  try {
    const checkResultEmail = await pool.query("SELECT * FROM users WHERE email = $1", [email,]);
    const checkResultUsername = await pool.query("SELECT * FROM users WHERE username = $1", [username,]);
    if (checkResultEmail.rows.length > 0) {
        let emailMessage = "User with this email already exists";
        res.render("register.ejs", {emailMessage: emailMessage, year: year});
    } else if (username.length < 6) {
        let nameMessage = "Username is too short";
        res.render("register.ejs", {nameMessage: nameMessage, year: year});
    } else if (checkResultUsername.rows.length > 0) {
        let nameMessage = "User with this name already exists";
        res.render("register.ejs", {nameMessage: nameMessage, year: year});
    } else if (checkRegisterPassword(password, repPassword)[0] == false) {
        passwordMessage = checkRegisterPassword(password, repPassword)[1];
        res.render("register.ejs", {passwordMessage: passwordMessage, year: year});
    }
    
    else {
        bcrypt.hash(password, saltRounds, async (err, hash) => {
            if (err) {
                res.send(err);
            } else {
                const result = await pool.query(
                    "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *", 
                    [username, email, hash]
                );
                setTimeout(() => {
                    const user = result.rows[0];
                    req.login(user, (err) => {
                        if (req.body.name) {
                            res.redirect(`/home-page/${req.body.name}`);
                        } else {
                            res.redirect(`/login`);
                        }
                        
                    }, 1000)});      
                }
            })
        }
    } catch (err) {
        console.log(err);
      }    
});


passport.serializeUser((user, cb) => {
    cb(null, user);
});

passport.deserializeUser((user, cb) => {
    cb(null, user);
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`)
});


async function getFilterCriteria (group, category, type, criteria) {
    let listDemo = [];
    let cleanCriteria = [];
    let getCriteria = await pool.query(`SELECT ${criteria} FROM products WHERE target_group = $1 AND category = $2 AND product_type = $3`, [group, category, type]);
    for (let criteria of getCriteria.rows) {
        listDemo.push(criteria);
    }

    for (let c of listDemo) {
        if (criteria === "color") {
            cleanCriteria.push(c[criteria].toLowerCase());
        } else {
            cleanCriteria.push(c[criteria]);
        }
    }

    let listDemo2 = new Set(cleanCriteria);
    let allCriteria = new Array(...listDemo2);
    return allCriteria;
}




function checkRegisterPassword (password, reppeatedPassword) {
    const symbols = "+-()&#%$".split("");
    let symbolsCount = 0;
    const alphabetLowerCase = 'abcdefghijklmnopqrstuvwxyz'.split('');
    let lowerCaseCount = 0;
    const alphabetUpperCase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');
    let upperCaseCount = 0;
    const numbers  = "1234567890".split("");
    let numbersCount = 0;
    for (var i = 0; i < symbols.length; i++) {
        if (password.includes(symbols[i])) {
            symbolsCount++;
            if (symbolsCount > 0) {
                break;
            }
        } 
    }

    for (var i = 0; i < alphabetLowerCase.length; i++) {
        if (password.includes(alphabetLowerCase[i])) {
            lowerCaseCount++;
            if (lowerCaseCount > 0) {
                break;
            }
        }
    }

    for (var i = 0; i < alphabetUpperCase.length; i++) {
        if (password.includes(alphabetUpperCase[i])) {
            upperCaseCount++;
            if (upperCaseCount > 0) {
                break;
            }
        }
    }

    for (var i = 0; i < numbers.length; i++) {
        if (password.includes(numbers[i])) {
            numbersCount++;
            if (numbersCount > 0) {
                break;
            }
        }
    }


    if (password != reppeatedPassword) {
        let passwordMessage = "Passwords don't match";
        return [false, passwordMessage];
    }
    else if (password.length < 6) {
        let passwordMessage = "Password is too short";
        return [false, passwordMessage];
    }
    else if (password.length > 20) {
        let passwordMessage = "Password is too long";
        return [false, passwordMessage];
    }
    else if (symbolsCount < 1) {
        let passwordMessage = "Password must have at least 1 of these symbols: +, -, (, ), &, #, %, $";
        return [false, passwordMessage];
    }
    else if (lowerCaseCount < 1) {
        let passwordMessage = "Password must contains at least 1 lower cased character";
        return [false, passwordMessage];
    }
    else if (upperCaseCount < 1) {
        let passwordMessage = "Password must contains at least 1 upper cased character";
        return [false, passwordMessage];
    }
    else if (numbersCount < 1) {
        let passwordMessage = "Password must contains at least 1 number";
        return [false, passwordMessage];
    }
    else {
        return true;
    }
    
}













