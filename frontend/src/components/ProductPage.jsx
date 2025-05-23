import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../style/productPageStyle/ProductPageStyle.css";
import { useUser } from "./user/UserContext";
import { useLocalCart } from "./cart/localCartContext";
import{ FaTimes } from 'react-icons/fa';
import Footer from './Footer'; // Import the Footer component
import Del_icon from 'frontend/public/assets/button icons/del_icon.svg';


const ProductPage = () => {
  const location = useLocation();
  const { product } = location.state || {};
  const { user } = useUser();
  const { cart, updateLocalCart } = useLocalCart();
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [size, setSize] = useState(product?.sizes?.[0] || "Large");
  const [color, setColor] = useState(product?.colors?.[0] || "");
  const [userNames, setUserNames] = useState({});
  const [comment, setComment] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const [imgIndex, setimgIndex] = useState("1");
  

  useEffect(() => {
    if (!product?.id) return;

    fetch(`http://localhost:8080/api/message/comments?productId=${product.id}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setReviews(data);
        fetchUserNames(data);
      })
      .catch((error) => console.error("Error fetching comments:", error));
  }, [product]);

  const fetchUserNames = async (reviews) => {
    const names = {};
    for (const review of reviews) {
      if (!names[review.sender]) {
        try {
          const response = await fetch(
            `http://localhost:8080/api/customers/get-user-id?id=${review.sender}`
          );
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          const data = await response.json();
          names[review.sender] = data.name;
        } catch (error) {
          console.error(`Error fetching username for ${review.sender}:`, error);
          names[review.sender] = "Unknown User";
        }
      }
    }
    setUserNames(names);
  };

  const postComment = async () => {
    const url = `http://localhost:8080/api/message/add-comment?productId=${product.id}&message=${comment}&sender=${user.userId}`;
    try {
      const response = await fetch(url, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const newComment = await response.json();
      
      setReviews((prevReviews) => [
        ...prevReviews,
        { 
          id: newComment.id, // Changed from _id to id to match Java backend
          sender: newComment.sender,
          message: newComment.message,
          productId: newComment.productId,
          createdAt: newComment.createdAt
        },
      ]);
      
      setUserNames((prevUserNames) => ({
        ...prevUserNames,
        [user.userId]: user.name || "Unknown User",
      }));
      
      setComment(""); // Clear comment input
    } catch (error) {
      console.error("Error posting comment:", error);
    }
  };

  const deleteComment = async (commentId) => {
    try {
      const response = await fetch(`http://localhost:8080/api/message/delete-comment?id=${commentId}`, {
        method: "DELETE",
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      setReviews((prevReviews) => prevReviews.filter((review) => review.id !== commentId));
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const addProductToCart = async () => {
    const order = {
      productId: product.id,
      productColor: color,
      productSize: size,
      quantity: quantity,
    };

    updateLocalCart(order,product.quantity);

    if (user.userId < 0 || !user.userId) return;
    console.log(user.userId);
    try {
      const response = await fetch(
        `http://localhost:8080/api/cart/add-to-cart?productId=${product.id}&color=${color}&size=${size}&quantity=${quantity}&userId=${user.userId}`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to add product to cart. Status: ${response}`);
      }
      setIsModalOpen(true); // Show the modal
    } catch (error) {
      console.error("Error adding product to cart:", error);
      
    }
  };
  
  

  const handleQuantityChange = (change) => {
    setQuantity((prevQuantity) => {
      const newQuantity = prevQuantity + change;
      return newQuantity > product.quantity ? product.quantity : newQuantity < 1 ? 1 : newQuantity;
    });
  };

  const handleContinueShopping = () => {
    setIsModalOpen(false);
    navigate('/shop');
  };

  const handleGoToCart = () => {
    navigate('/cart');
  };

  if (!product) {
    return <div className="loading-message">Loading...</div>;
  }
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleEditProduct = () => {
    // Function to handle editing the product
    console.log("Edit product clicked");
    // Add your edit product logic here
  };

  

  return (
    <div className="product-page">
      <div className="product-container">
        <div className="product-image-wrapper">
        <img
    src={`data:image/jpeg;base64,${product.image[imgIndex-1].image}`}
    alt={product.name}
    className="main-product-image"
  />
  <div className="thumbnail-container">
{product.image.map((image, index) => (
    <img
      key={index}
      src={`data:image/jpeg;base64,${image.image}`}
      alt={`${product.name} ${index + 1}`}
      className="product-thumbnail"
      onClick={() => setimgIndex(index+1)}
    />
  ))}
  </div>
</div>
        <div className="product-info-wrapper">
          <h1 className="product-name-inner">{product.name}</h1>
          <p className="product-price-inner">${product.price}</p>
          <h5 className="product-description">{product.description}</h5>
          <p className="product-quantity">Available Quantity: {product.quantity}</p>
          {/* <p className="product-brand">brand: {product.brand}</p>
          <p className="product-category">category: {Array.isArray(product.tags) ? product.tags.join(', ') : product.tags}</p>
          <p className="product-style">style: {Array.isArray(product.styles) ? product.styles.join(', ') : product.styles}</p> */}
          <div className="product-options">
            <div className="color-selection">
              <h3>Select Color:</h3>
              <div className="options">
                {product.colors.map((clr, index) => (
                  <div
                    key={index}
                    className={`color-option1 ${color === clr ? 'selected' : ''}`}
                    onClick={() => setColor(clr)}
                  >
                    <div
                    className={`color-circle ${color === clr ? 'selected' : ''}`}
                    style={{ backgroundColor: clr }}
                    ></div>
                    <span className="color-name">{clr}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="size-selector-container">
              <div className="size-toolbar">
                  <h3>Select Size:</h3>
                  <div className="size-dropdown">
                    <nav role="navigation" className="primary-navigation">
                      <ul>
                        <li>Size <span>{size}</span>
                          <ul className="dropdown">
                            {product?.sizes?.map((sizeOption) => (
                              <li 
                                key={sizeOption} 
                                onClick={() => {
                                  setSize(sizeOption);
                                  
                                }}
                              >
                                <a>{sizeOption}</a>
                              </li>
                            ))}
                          </ul>
                        </li>
                      </ul>
                    </nav>
                  </div>
              </div>
            </div>
            <div className="quantity-selector">
              <p>Quantity:</p>
              <div className="quantity-buttons">
                <button onClick={() => handleQuantityChange(-1)}>-</button>
                <span>{quantity}</span>
                <button onClick={() => handleQuantityChange(1)}>+</button>
              </div>
            </div>
          </div>

          {user.type !== "admin" ? (
            <button className="add-to-cart-button" onClick={addProductToCart}>
              Add to Cart
            </button>
          ) : (
            <button className="add-to-cart-button" onClick={handleEditProduct}>
              Edit Product
            </button>
          )}
        </div>
      </div>

      <div className="product-reviews">
        <h2>Customer Reviews</h2>
        {user.userStatus ? (
        <div className="comment-section">
          <input
            type="text"
            placeholder="Write a comment..."
            className="comment-input"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <button className="post-comment-button" onClick={postComment}>
            Post Comment
          </button>
        </div>
      ) : (
        <p className="login-prompt">Please log in to write a comment.</p>
      )}

        <div className="reviews-list">
        {reviews?.length > 0 ? (
  [...reviews].reverse().map((review, index) => (
    <div key={index} className="review-item">
      <p className="review-user">{userNames[review.sender] || "Loading..."}</p>
      <p className="review-text">{review.message}</p>
      {(user.type === "admin" || user.userId === review.sender) && (
        <button className="delete-comment-button" onClick={() => deleteComment(review.id)}>
          <img src="/assets/button icons/del_icon.svg" alt="delete" />
        </button>
      )}
    </div>
  ))
) : (
  <p>No reviews available.</p>
)}
        </div>
      </div>

      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
          <FaTimes className="close-icon" onClick={handleCloseModal} />
            <h2>Product added to cart</h2>
            <button onClick={handleContinueShopping}>Continue Shopping</button>
            <button onClick={handleGoToCart}>Go to Cart</button>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProductPage;
