$(document).ready(function() {
    
    // 1. 商品資料庫 (請確保圖片路徑正確)
    const products = [
        {
            id: "1",
            title: "【SMEG】彩色復古迷你冰箱34L-珍珠白",
            price: 75800,
            image: "static/images/microwave.png",
            promo: ""
        },
        {
            id: "2",
            title: "【SONGEN 松井】日系冷暖雙溫電子冰箱/冷藏箱",
            price: 0, 
            image: "static/images/hairdryer.png",
            promo: ""
        },
        {
            id: "3",
            title: "【Whirlpool 惠而浦】740L 大容量定頻對開門冰箱",
            price: 44910,
            image: "static/images/fridge.png",
            promo: "滿額登記送 1500 mo幣"
        },
        {
            id: "4",
            title: "【TECO 東元】白大廚 23L 氣炸烤微波爐",
            price: 6990,
            image: "static/images/microwave.png",
            promo: "今日限定"
        },
        {
            id: "5",
            title: "【Panasonic】吹風機奈米水離子",
            price: 4990,
            image: "static/images/hairdryer.png",
            promo: ""
        }
    ];

    // --- 功能 A：檢查登入狀態並更新導航列 ---
    function updateAuthUI() {
        const loginUser = localStorage.getItem('loginUser');
        const $authLinks = $('.top-right-links');

        if (loginUser) {
            // 已登入狀態：更換導航列內容
            $authLinks.html(`
                <span style="color: #e5004f; font-weight: bold;">您好，${loginUser}</span>
                <a href="#" id="btnLogout">登出</a>
                <a href="member.html">會員中心</a>
                <a href="#">查訂單</a>
                <a href="cart.html" class="cart-link">
                    <i class="fas fa-shopping-cart"></i> 購物車(<span id="cart-count">0</span>)
                </a>
            `);
        }
    }

    // 處理登出點擊
    $(document).on('click', '#btnLogout', function(e) {
        e.preventDefault();
        localStorage.removeItem('loginUser');
        alert('已登出');
        location.reload(); 
    });

    // --- 功能 B：渲染商品列表 ---
    function renderList(list) {
        let html = '';
        list.forEach(item => {
            const priceHtml = item.price > 0 
                ? `<p class="price">$ ${item.price.toLocaleString()}</p>` 
                : `<p class="out-of-stock">熱銷一空</p>`;
            
            const promoHtml = item.promo ? `<div class="promo-badge">${item.promo}</div>` : '';

            html += `
                <div class="product-card" data-id="${item.id}">
                    <div class="card-img-wrapper">
                        <img src="${item.image}" alt="${item.title}">
                    </div>
                    <p class="name">${item.title}</p>
                    ${promoHtml}
                    ${priceHtml}
                </div>
            `;
        });
        $('#product-list').html(html);
    }

    // 點擊商品卡片跳轉
    $(document).on('click', '.product-card', function() {
        const id = $(this).data('id');
        window.location.href = `product.html?id=${id}`;
    });

    // --- 功能 C：更新購物車數量 ---
    function updateCartCount() {
        let cart = JSON.parse(localStorage.getItem('myCart')) || [];
        let total = cart.reduce((sum, item) => sum + item.qty, 0);
        $('#cart-count').text(total); 
    }

    // --- 執行初始化 ---
    updateAuthUI();      // 1. 檢查登入
    renderList(products); // 2. 畫出商品
    updateCartCount();   // 3. 更新購物車數字
});






//如果productList.js有錯誤可以使用這個
$(document).ready(function() {
    
    // --- 🚩 權限與狀態初始化 ---
    const userRole = localStorage.getItem('userRole'); 
    const loginUser = localStorage.getItem('loginUser'); 

    // --- 功能 A：檢查登入狀態並更新導航列 ---
    function updateAuthUI() {
        const $authLinks = $('.top-right-links'); 

        if (loginUser) {
            let adminHtml = (userRole === 'ADMIN') 
                ? `<span id="admin-menu"><a href="home.html" style="color: #e67e22; font-weight: bold;"><i class="fas fa-plus-circle"></i> 商品上架管理</a><span style="color:#ccc; margin:0 10px;">|</span></span>` 
                : '';

            $authLinks.html(`
                ${adminHtml}
                <span style="color: #e5004f; font-weight: bold;">您好，${loginUser}</span>
                <a href="#" id="btnLogout">登出</a>
                <a href="member.html">會員中心</a>
                <a href="#">查訂單</a>
                <a href="cart.html" class="cart-link">
                    <i class="fas fa-shopping-cart"></i> 購物車(<span id="cart-count">0</span>)
                </a>
            `);
        } else {
            $('#admin-menu').hide();
        }
    }

    // --- 功能 B：從資料庫抓取商品並渲染 ---
    function fetchAndRenderProducts() {
        $.ajax({
            url: '/api/products', 
            method: 'GET',
            success: function(products) {
                const $list = $('#product-list');
                $list.empty(); 

                if (products.length === 0) {
                    $list.html('<p style="text-align:center; width:100%;">目前沒有商品上架中</p>');
                    return;
                }

                products.forEach(product => {
                    const priceDisplay = product.price > 0 
                        ? `<p class="product-price">單價：$${product.price.toLocaleString()}</p>` 
                        : `<p class="out-of-stock">熱銷一空</p>`;
                    
                    const imgUrl = product.imageUrl || 'static/images/default.png';

                    const cardHtml = `
                        <div class="product-card" data-id="${product.id}" style="cursor: pointer;">
                            <div class="card-img-wrapper">
                                <img src="${imgUrl}" alt="${product.title}" class="product-img">
                            </div>
                            <div class="product-info">
                                <h3 class="product-title">${product.title}</h3>
                                <p class="product-description">${product.description || '暫無描述'}</p>
                                ${priceDisplay}
                                <p class="product-stock" style="color: ${product.stock <= 5 ? 'red' : '#666'};">
                                    庫存：${product.stock || 0}
                                </p>
                            </div>
                            
                            ${userRole === 'ADMIN' ? `
                                <div class="admin-actions" style="padding: 10px; text-align: right; border-top: 1px dashed #eee;">
                                    <button class="btn-edit" data-id="${product.id}" style="cursor:pointer; background:none; border:none; font-size:18px;">✏️</button>
                                    <button class="btn-delete" data-id="${product.id}" data-title="${product.title}" style="cursor:pointer; background:none; border:none; font-size:18px;">🗑️</button>
                                </div>
                            ` : ''}
                        </div>
                    `;
                    $list.append(cardHtml);
                });
            },
            error: function(err) {
                console.error("無法取得商品資料:", err);
                $('#product-list').html('<p style="color:red; text-align:center;">伺服器連線失敗，無法載入商品</p>');
            }
        });
    }

    // --- 🚩 功能 C：更新購物車數量 (已封裝成函數) ---
    function updateCartCount() {
        const currentUser = localStorage.getItem('loginUser') || 'guest';
        const cartKey = `myCart_${currentUser}`;
        let cart = JSON.parse(localStorage.getItem(cartKey)) || [];
        let total = cart.reduce((sum, item) => sum + item.qty, 0);
        $('#cart-count').text(total);
    }

    // --- 🚩 事件監聽 ---
    
 	// 攔截購物車點擊
    $(document).on('click', '.cart-link', function(e) {
        if (!localStorage.getItem('loginUser')) {
            e.preventDefault(); 
            $('#login-modal').css('display', 'flex'); 
        }
    });
    
    $(document).on('click', '#btn-go-login', function() {
        window.location.href = 'login.html';
    });

    $(document).on('click', '#btn-close-modal', function() {
        $('#login-modal').hide();
    });

    // 1. 處理登出
    $(document).on('click', '#btnLogout', function(e) {
        e.preventDefault();
        localStorage.removeItem('loginUser');
        localStorage.removeItem('userRole'); 
        alert('已登出');
        location.reload(); 
    });

    // 2. 點擊商品卡片跳轉詳情頁
    $(document).on('click', '.product-card', function(e) {
        if ($(e.target).closest('.admin-actions').length) {
            return; 
        }
        const productId = $(this).data('id');
        if (productId) {
            window.location.href = `product.html?id=${productId}`;
        }
    });

    // 3. 管理員：編輯
    $(document).on('click', '.btn-edit', function() {
        const id = $(this).data('id');
        alert('前往編輯商品 ID: ' + id);
    });

    // 4. 管理員：刪除
    $(document).on('click', '.btn-delete', function() {
        const id = $(this).data('id');
        const title = $(this).data('title');
        if (confirm(`確定要刪除「${title}」嗎？`)) {
            $.ajax({
                url: `/api/products/${id}`,
                method: 'DELETE',
                success: function() {
                    alert('刪除成功');
                    fetchAndRenderProducts(); 
                }
            });
        }
    });

    // --- 🚩 程式啟動 ---
    updateAuthUI();           
    fetchAndRenderProducts(); 
    updateCartCount(); // 🚩 這裡現在可以正確找到上面的 function 了
});




//如果product.js有錯誤可以使用這個(第一優先)
$(document).ready(function() {
    // --- 1. 取得 URL ID 並進行攔截 ---
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get("id");

    if (!productId) {
        $('.main-container').hide(); 
        $('body').append('<div style="text-align:center; padding:100px;"><h2>請從商品列表選購商品</h2><a href="index.html" style="color:#4ec3e0;">回首頁</a></div>');
        return; 
    }

    window.currentProduct = null;

    loadProduct(productId);

    function loadProduct(id) {
        const API_URL = `/api/products/${encodeURIComponent(id)}`;
        $.ajax({
            url: API_URL,
            method: "GET",
            dataType: "json",
            success: function(data) {
                window.currentProduct = data;
                renderProduct(data);
                updateCartCount(); // 🚩 此處會根據使用者顯示正確數量
                updateTotal(); 
            },
            error: function() {
                $('.main-container').html('<h2 style="text-align:center; padding:100px;">找不到該商品</h2>');
            }
        });
    }

    // --- 2. 取得當前購物車 Key 的公用函數 ---
    // 這樣可以確保所有地方用的 Key 規則都一致
    function getCartKey() {
        const currentUser = localStorage.getItem('loginUser') || 'guest';
        return `myCart_${currentUser}`;
    }

    // --- 3. 計算總金額函數 ---
    function updateTotal() {
        if (window.currentProduct) {
            const qty = parseInt($('.qty-input').val()) || 1;
            const price = window.currentProduct.price || 0;
            const total = qty * price;
            $('#render-total-amount').text(total.toLocaleString());
        }
    }

    // --- 4. 核心功能：存入專屬購物車 ---
    function saveToCart(qty) {
        if (!window.currentProduct) return;
        
        const cartKey = getCartKey(); // 🚩 取得如 myCart_aslo2 的專屬 Key
        let cart = JSON.parse(localStorage.getItem(cartKey)) || [];
        
        const existingItem = cart.find(item => item.id === window.currentProduct.id);
        
        if (existingItem) {
            existingItem.qty += qty;
        } else {
            cart.push({
                id: window.currentProduct.id,
                name: window.currentProduct.title,
                price: window.currentProduct.price,
                img: window.currentProduct.imageUrl,
                qty: qty                            
            });
        }
        localStorage.setItem(cartKey, JSON.stringify(cart));
    }

    // --- 事件處理 ---
    
    $('.plus').click(function() {
        let val = parseInt($('.qty-input').val());
        $('.qty-input').val(val + 1);
        updateTotal();
    });

    $('.minus').click(function() {
        let val = parseInt($('.qty-input').val());
        if (val > 1) {
            $('.qty-input').val(val - 1);
            updateTotal();
        }
    });

    $('.qty-input').on('input', function() {
        let val = parseInt($(this).val());
        if (isNaN(val) || val < 1) val = 1;
        updateTotal();
    });

    $('.btn-add-cart').click(function() {
        const qty = parseInt($('.qty-input').val()) || 1;
        saveToCart(qty); 
        updateCartCount(); // 更新專屬購物車計數
        
        const $btn = $(this);
        const originalHtml = $btn.html();
        $btn.html('<i class="fas fa-check"></i> 已加入！').css('background-color', '#28a745').prop('disabled', true);
        
        setTimeout(() => {
            $btn.html(originalHtml).css('background-color', '').prop('disabled', false);
            if (confirm('商品已成功加入！是否立即前往購物車結帳？')) {
                window.location.href = 'cart.html';
            }
        }, 800);
    });

    $('.btn-direct-buy').click(function() {
        const qty = parseInt($('.qty-input').val()) || 1;
        saveToCart(qty);
        window.location.href = 'cart.html';
    });

    $('.cart-status').click(function() {
        window.location.href = 'cart.html';
    });

    function renderProduct(data) {
        const price = data.price || 0;
        $('#render-title').html(`${data.title || '無標題'}`);
        $('#render-capacity').text(data.category || "家電");
        $('#render-market-price').text(`$ ${(price * 1.2).toLocaleString()}`);
        $('#render-current-price').text(price.toLocaleString());
        $('#render-brand').text("TECO 東元");
        $('#render-features').html(`<li>${data.description || '暫無產品描述'}</li>`);

        const imgPath = data.imageUrl || 'static/images/default.png';
        $('#mainImage').attr('src', imgPath);
        $('#render-thumbnails').html(`<img src="${imgPath}" class="thumb active" alt="縮圖">`);
    }

    // 🚩 修改：根據當前使用者更新購物車數量
    function updateCartCount() {
        const cartKey = getCartKey(); 
        let cart = JSON.parse(localStorage.getItem(cartKey)) || [];
        let total = cart.reduce((sum, item) => sum + item.qty, 0);
        $('#cart-count').text(total); 
    }

    $(document).on('click', '.thumb', function() {
        $('#mainImage').attr('src', $(this).attr('src'));
        $('.thumb').removeClass('active');
        $(this).addClass('active');
    });
});









//如果product.js有錯誤可以使用這個(第二優先)
$(document).ready(function() {
    // --- 1. 取得 URL ID 並進行攔截 ---
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get("id");
    console.log("網址抓到的 ID:", productId);

    if (!productId) {
        $('.main-container').hide(); 
        $('body').append('<div style="text-align:center; padding:100px;"><h2>請從商品列表選購商品</h2><a href="index.html" style="color:#4ec3e0;">回首頁</a></div>');
        return; 
    }

    window.currentProduct = null;

    loadProduct(productId);

    function loadProduct(id) {
        const API_URL = `/api/products/${encodeURIComponent(id)}`;
        
        $.ajax({
            url: API_URL,
            method: "GET",
            dataType: "json",
            success: function(data) {
                window.currentProduct = data;
                renderProduct(data);
                updateCartCount(); 
                updateTotal(); 
            },
            error: function() {
                $('.main-container').html('<h2 style="text-align:center; padding:100px;">找不到該商品</h2>');
            }
        });
    }

    // --- 2. 計算總金額函數 ---
    function updateTotal() {
        if (window.currentProduct) {
            const qty = parseInt($('.qty-input').val()) || 1;
            const price = window.currentProduct.price || 0;
            const total = qty * price;
            $('#render-total-amount').text(total.toLocaleString());
        }
    }

    // --- 3. 核心功能：存入購物車 (對應 cart.js 格式) ---
    function saveToCart(qty) {
        if (!window.currentProduct) return;
        
        // 注意：這裡的 Key 必須是 'myCart' 以便 cart.js 讀取
        let cart = JSON.parse(localStorage.getItem('myCart')) || [];
        
        const existingItem = cart.find(item => item.id === window.currentProduct.id);
        
        if (existingItem) {
            existingItem.qty += qty;
        } else {
            // 🚩 這裡的欄位名稱必須跟 cart.js 裡的 renderCart 完全一樣
            cart.push({
                id: window.currentProduct.id,
                name: window.currentProduct.title,  // 對應 item.name
                price: window.currentProduct.price, // 對應 item.price
                img: window.currentProduct.imageUrl, // 對應 item.img
                qty: qty                            // 對應 item.qty
            });
        }
        localStorage.setItem('myCart', JSON.stringify(cart));
    }

    // --- 事件處理 ---
    
    // 數量增加
    $('.plus').click(function() {
        let val = parseInt($('.qty-input').val());
        $('.qty-input').val(val + 1);
        updateTotal();
    });

    // 數量減少
    $('.minus').click(function() {
        let val = parseInt($('.qty-input').val());
        if (val > 1) {
            $('.qty-input').val(val - 1);
            updateTotal();
        }
    });

    // 手動輸入數量
    $('.qty-input').on('input', function() {
        let val = parseInt($(this).val());
        if (isNaN(val) || val < 1) val = 1;
        updateTotal();
    });

    // 加入購物車按鈕 (含動畫效果)
    $('.btn-add-cart').click(function() {
        const qty = parseInt($('.qty-input').val()) || 1;
        saveToCart(qty); 
        updateCartCount(); 
        
        // 動畫反饋
        const $btn = $(this);
        const originalHtml = $btn.html();
        $btn.html('<i class="fas fa-check"></i> 已加入！').css('background-color', '#28a745').prop('disabled', true);
        
        setTimeout(() => {
            $btn.html(originalHtml).css('background-color', '').prop('disabled', false);
            
            // 🚩 加入成功後，詢問是否前往結帳 (你剛才要求的整合點)
            if (confirm('商品已成功加入！是否立即前往購物車結帳？')) {
                window.location.href = 'cart.html';
            }
        }, 800); // 縮短一點等待時間，讓體驗更流暢
    });

    // 直接購買
    $('.btn-direct-buy').click(function() {
        const qty = parseInt($('.qty-input').val()) || 1;
        saveToCart(qty);
        window.location.href = 'cart.html';
    });

    // 點擊右上角購物車圖示
    $('.cart-status').click(function() {
        window.location.href = 'cart.html';
    });

    function renderProduct(data) {
        const price = data.price || 0;
        $('#render-title').html(`${data.title || '無標題'}`);
        $('#render-capacity').text(data.category || "家電");
        $('#render-market-price').text(`$ ${(price * 1.2).toLocaleString()}`);
        $('#render-current-price').text(price.toLocaleString());
        $('#render-brand').text("TECO 東元");
        $('#render-features').html(`<li>${data.description || '暫無產品描述'}</li>`);

        const imgPath = data.imageUrl || 'static/images/default.png';
        $('#mainImage').attr('src', imgPath);
        $('#render-thumbnails').html(`<img src="${imgPath}" class="thumb active" alt="縮圖">`);
    }

    function updateCartCount() {
        let cart = JSON.parse(localStorage.getItem('myCart')) || [];
        let total = cart.reduce((sum, item) => sum + item.qty, 0);
        $('#cart-count').text(total); 
    }

    $(document).on('click', '.thumb', function() {
        $('#mainImage').attr('src', $(this).attr('src'));
        $('.thumb').removeClass('active');
        $(this).addClass('active');
    });
});


//如果cart.js有錯誤,可以使用這個

$(document).ready(function() {
    let cartData = JSON.parse(localStorage.getItem('myCart')) || [];
    const shippingFee = 100; // 運費
    const discountAmount = 200; // 活動折抵金額

    renderCart();

    function renderCart() {
        let itemsHtml = '';
        let subtotal = 0;

        if (cartData.length === 0) {
            $('#cartItemsList').html('<div class="cart-item">您的購物車是空的</div>');
            updateSummary(0);
            // 當購物車完全清空時，確保 localStorage 也被移除
            localStorage.removeItem('myCart');
        } else {
            cartData.forEach((item, index) => {
                subtotal += item.price * item.qty;
                itemsHtml += `
                <div class="cart-item" data-index="${index}">
                    <img src="${item.img}">
                    <div class="item-info">
                        <h4>${item.name}</h4>
                        <p>$${item.price.toLocaleString()}</p>
                        <div class="quantity-selector" style="margin-top:10px;">
                            <button class="qty-btn minus">-</button>
                            <input type="number" class="qty-input" value="${item.qty}" readonly>
                            <button class="qty-btn plus">+</button>
                        </div>
                    </div>
                    <div class="item-price">$${(item.price * item.qty).toLocaleString()}</div>
                    <div class="item-remove"><i class="fas fa-trash-alt"></i></div>
                </div>`;
            });
            $('#cartItemsList').html(itemsHtml);
            updateSummary(subtotal);
            // 同步回存最新的資料
            localStorage.setItem('myCart', JSON.stringify(cartData));
        }
    }

    function updateSummary(subtotal) {
        // 1. 判斷是否有商品
        const hasItems = subtotal > 0;
        
        // 2. 計算折抵 (如果有商品才折抵)
        const currentDiscount = hasItems ? discountAmount : 0;
        
        // 3. 計算總額 (小計 + 運費 - 折抵)
        // 使用 Math.max(0, ...) 確保總額不會出現負數
        const total = hasItems ? Math.max(0, subtotal + shippingFee - currentDiscount) : 0;

        // 4. 更新 UI 介面
        $('#subtotal').text(`$ ${subtotal.toLocaleString()}`);
        $('#shipping').text(`$ ${hasItems ? shippingFee : 0}`);
        $('#discount').text(`-$ ${currentDiscount.toLocaleString()}`); // 更新折抵顯示
        $('#finalTotal').text(`$ ${total.toLocaleString()}`);
    }

    // --- 事件監聽保持不變 ---
    $(document).on('click', '.plus', function() {
        const index = $(this).closest('.cart-item').data('index');
        cartData[index].qty++;
        renderCart();
    });

    $(document).on('click', '.minus', function() {
        const index = $(this).closest('.cart-item').data('index');
        if (cartData[index].qty > 1) { cartData[index].qty--; renderCart(); }
    });

    $(document).on('click', '.item-remove', function() {
        const index = $(this).closest('.cart-item').data('index');
        if(confirm('確定移除？')) { 
            cartData.splice(index, 1); 
            renderCart(); 
        }
    });
});