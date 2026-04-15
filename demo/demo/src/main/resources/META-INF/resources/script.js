let cart = [];

function addToCart(name, price) {
    cart.push({ name, price });
    displayCart();
}

function displayCart() {
    const cartItemsDiv = document.getElementById('cartItems');
    cartItemsDiv.innerHTML = '';
    cart.forEach(item => {
        cartItemsDiv.innerHTML += `<p>${item.name} - $${item.price}</p>`;
    });
}

function checkout() {
    // 導向結帳頁面，這裡可以使用 AJAX 發送信息到後端
    window.location.href = '/checkout';
}