const httpStatus = require("http-status");
const { Cart, Product } = require("../models");
const ApiError = require("../utils/ApiError");
const config = require("../config/config");

// TODO: CRIO_TASK_MODULE_CART - Implement the Cart service methods

/**
 * Fetches cart for a user
 * - Fetch user's cart from Mongo
 * - If cart doesn't exist, throw ApiError
 * --- status code  - 404 NOT FOUND
 * --- message - "User does not have a cart"
 *
 * @param {User} user
 * @returns {Promise<Cart>}
 * @throws {ApiError}
 */
const getCartByUser = async (user) => {
  const cart = await Cart.findOne({email:user.email});
  if(!cart){
  throw new ApiError(httpStatus.NOT_FOUND ,"User does not have a cart");
  }
  return cart;

};

/**
 * Adds a new product to cart
 * - Get user's cart object using "Cart" model's findOne() method
 * --- If it doesn't exist, create one
 * --- If cart creation fails, throw ApiError with "500 Internal Server Error" status code
 *
 * - If product to add already in user's cart, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product already in cart. Use the cart sidebar to update or remove product from cart"
 *
 * - If product to add not in "products" collection in MongoDB, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product doesn't exist in database"
 *
 * - Otherwise, add product to user's cart
 *
 *
 *
 * @param {User} user
 * @param {string} productId
 * @param {number} quantity
 * @returns {Promise<Cart>}
 * @throws {ApiError}
 */
const addProductToCart = async (user, productId, quantity) => {
  //first check if cart is there
let cart = await Cart.findOne({email:user.email});

if(!cart){
  cart = await Cart.create({email:user.email , cartItems:[]});

  //if cart creation failed
  if(!cart){
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR)
  }
}

for(let cartItem of cart.cartItems){
  if(cartItem.product._id == productId){
    throw new ApiError(httpStatus.BAD_REQUEST , "Product already in cart. Use the cart sidebar to update or remove product from cart");
  }
}

//find product in product model
const product = await Product.findById(productId);
//if not found
if(!product){
  throw new ApiError(httpStatus.BAD_REQUEST ,"Product doesn't exist in database")
}


cart.cartItems.push({product:product ,quantity:quantity});

await cart.save();
return cart;

};

/**
 * Updates the quantity of an already existing product in cart
 * - Get user's cart object using "Cart" model's findOne() method
 * - If cart doesn't exist, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "User does not have a cart. Use POST to create cart and add a product"
 *
 * - If product to add not in "products" collection in MongoDB, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product doesn't exist in database"
 *
 * - If product to update not in user's cart, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product not in cart"
 *
 * - Otherwise, update the product's quantity in user's cart to the new quantity provided and return the cart object
 *
 *
 * @param {User} user
 * @param {string} productId
 * @param {number} quantity
 * @returns {Promise<Cart>
 * @throws {ApiError}
 */
const updateProductInCart = async (user, productId, quantity) => {

  const cart = await Cart.findOne({email:user.email});
  
  if(!cart){
   throw new ApiError(httpStatus.BAD_REQUEST ,"User does not have a cart. Use POST to create cart and add a product");
  }

  const product =await Product.findById(productId);
   if(!product){
    throw new ApiError(httpStatus.BAD_REQUEST ,"Product doesn't exist in database")
  }

  let produtInedx = -1;

  for(let i=0;i<cart.cartItems.length;i++){
    if(cart.cartItems[i].product._id == productId){
      produtInedx = i;
    }
  }

  //if not found that product in cartitems
if(produtInedx == -1){
 throw new ApiError(httpStatus.BAD_REQUEST ,"Product not in cart");
}

//else update quantity
cart.cartItems[produtInedx].quantity =quantity;
await cart.save();
return cart;

};

/**
 * Deletes an already existing product in cart
 * - If cart doesn't exist for user, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "User does not have a cart"
 *
 * - If product to update not in user's cart, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product not in cart"
 *
 * Otherwise, remove the product from user's cart
 *
 *
 * @param {User} user
 * @param {string} productId
 * @throws {ApiError}
 */
const deleteProductFromCart = async (user, productId) => {
 const cart = await Cart.findOne({email:user.email});
 if(!cart){
  throw new ApiError(httpStatus.BAD_REQUEST,"User does not have a cart");
 }
 
 let produtInedx = -1;

 for(let i=0;i<cart.cartItems.length;i++){
   if(cart.cartItems[i].product._id == productId){
     produtInedx = i;
   }
 }

 if(produtInedx == -1){
  throw new ApiError(httpStatus.BAD_REQUEST ,"Product not in cart");
 }

 //else remove product from cart
cart.cartItems.splice(produtInedx , 1);
await cart.save();
return cart;

};



// TODO: CRIO_TASK_MODULE_TEST - Implement checkout function
/**
 * Checkout a users cart.
 * On success, users cart must have no products.
 *
 * @param {User} user
 * @returns {Promise}
 * @throws {ApiError} when cart is invalid
 */
const checkout = async (user) => {

  const cart = await Cart.findOne({email :user.email});

  if(!cart){
    throw new ApiError(httpStatus.NOT_FOUND ,'User does not have a cart');
  }

  
  if(cart.cartItems && cart.cartItems.length == 0){
    throw  new ApiError(httpStatus.BAD_REQUEST,' User have empty cart');
  }

  const address = await user.hasSetNonDefaultAddress();
  if(!address){
    throw new ApiError(httpStatus.BAD_REQUEST ,"User doesn't have an address");
  }

//calculate totla value for products
let totalValue = 0;
for(let cartItem of cart.cartItems){
  totalValue +=cartItem.product.cost *cartItem.quantity;
}
//let check user balance

let balance = user.walletMoney-totalValue;

if(balance<0){
  throw new ApiError(httpStatus.BAD_REQUEST ,"Insufficient balance");

}

//else change user wallect money 
user.walletMoney = balance;
await user.save();

//make cart items equal to empty
cart.cartItems = [];

await cart.save();
return cart;

};

module.exports = {
  getCartByUser,
  addProductToCart,
  updateProductInCart,
  deleteProductFromCart,
  checkout,
};
