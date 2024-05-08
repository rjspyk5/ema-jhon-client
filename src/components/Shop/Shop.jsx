import React, { useEffect, useState } from "react";
import {
  addToDb,
  deleteShoppingCart,
  getShoppingCart,
} from "../../utilities/fakedb";
import Cart from "../Cart/Cart";
import Product from "../Product/Product";
import "./Shop.css";
import { Link, useLoaderData } from "react-router-dom";
import { useAxiosSecure } from "../../Hooks/AxiosSecure";
const Shop = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const axiosSecure = useAxiosSecure();
  const { count: pageCount } = useLoaderData();
  const [itemsPerPage, setitemsPerPage] = useState(10);
  const [currentPage, setcurrentPage] = useState(1);
  const numberOfPages = Math.ceil(pageCount / itemsPerPage);
  const pages = [...Array(numberOfPages).keys()];

  const handlePrevPageButton = () => {
    if (currentPage > 1) {
      setcurrentPage(currentPage - 1);
    }
  };
  const handleNextPageButton = () => {
    if (currentPage < 8) {
      setcurrentPage(currentPage + 1);
    }
  };

  //   const pages = [];
  //   for (let index = 0; index < numberOfPages; index++) {
  //     pages.push(i);
  //   }

  useEffect(() => {
    axiosSecure
      .get(`/products?page=${currentPage}&size=${itemsPerPage}`)
      .then((res) => setProducts(res.data));
  }, [currentPage, itemsPerPage]);

  useEffect(() => {
    const storedCart = getShoppingCart();
    const savedCart = [];
    // step 1: get id of the addedProduct
    for (const id in storedCart) {
      // step 2: get product from products state by using id
      const addedProduct = products.find((product) => product._id === id);
      if (addedProduct) {
        // step 3: add quantity
        const quantity = storedCart[id];
        addedProduct.quantity = quantity;
        // step 4: add the added product to the saved cart
        savedCart.push(addedProduct);
      }
      // console.log('added Product', addedProduct)
    }
    // step 5: set the cart
    setCart(savedCart);
  }, [products]);

  const handleAddToCart = (product) => {
    // cart.push(product); '
    let newCart = [];
    // const newCart = [...cart, product];
    // if product doesn't exist in the cart, then set quantity = 1
    // if exist update quantity by 1
    const exists = cart.find((pd) => pd._id === product._id);
    if (!exists) {
      product.quantity = 1;
      newCart = [...cart, product];
    } else {
      exists.quantity = exists.quantity + 1;
      const remaining = cart.filter((pd) => pd._id !== product._id);
      newCart = [...remaining, exists];
    }

    setCart(newCart);
    addToDb(product._id);
  };

  const handleClearCart = () => {
    setCart([]);
    deleteShoppingCart();
  };

  return (
    <div>
      <div className="shop-container">
        <div className="products-container">
          {products.map((product) => (
            <Product
              key={product._id}
              product={product}
              handleAddToCart={handleAddToCart}
            ></Product>
          ))}
        </div>
        <div className="cart-container">
          <Cart cart={cart} handleClearCart={handleClearCart}>
            <Link className="proceed-link" to="/orders">
              <button className="btn-proceed">Review Order</button>
            </Link>
          </Cart>
        </div>
      </div>

      <div className=" flex space-x-5">
        <button className="btn" onClick={handlePrevPageButton}>
          Prev
        </button>
        {pages.map((el) => (
          <button
            className={currentPage == el + 1 ? "bg-red-500 btn" : "btn"}
            onClick={() => setcurrentPage(el + 1)}
            key={el}
          >
            {el + 1}
          </button>
        ))}
        <select
          className="p-2"
          onChange={(e) => {
            setitemsPerPage(e.target.value);
            setcurrentPage(1);
          }}
          defaultValue={numberOfPages}
          name=""
          id=""
        >
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="30">30</option>
        </select>
        <button className="btn" onClick={handleNextPageButton}>
          Next
        </button>
      </div>
    </div>
  );
};

export default Shop;
