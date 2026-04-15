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
    function getCartKey() {
        const currentUser = localStorage.getItem('loginUser') || 'guest';
        return `myCart_${currentUser}`;
    }

    // --- 3. 計算總金額函數 ---
    function updateTotal() {
        if (window.currentProduct) {
            // 如果售完，總金額強制顯示 0
            if (window.currentProduct.stock <= 0) {
                $('#render-total-amount').text('0');
                return;
            }
            const qty = parseInt($('.qty-input').val()) || 1;
            const price = window.currentProduct.price || 0;
            const total = qty * price;
            $('#render-total-amount').text(total.toLocaleString());
        }
    }

    // --- 4. 核心功能：存入專屬購物車 ---
    function saveToCart(qty) {
        if (!window.currentProduct || window.currentProduct.stock <= 0) return; // 🚩 安全攔截
        
        const cartKey = getCartKey(); 
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
    	// 🚩 檢查是否登入
    	const loginUser = localStorage.getItem('loginUser');
    	if (!loginUser) {
        // 如果沒登入，顯示跟首頁一樣的彈窗
        $('#login-modal').css('display', 'flex'); 
        return; // 攔截，不往下執行
    }    
        const qty = parseInt($('.qty-input').val()) || 1;
        saveToCart(qty); 
        updateCartCount(); 
        
        const $btn = $(this);
        const originalHtml = $btn.html();
        $btn.html('<i class="fas fa-check"></i> 已加入！').css('background-color', '#28a745').prop('disabled', true);
        
        setTimeout(() => {
            $btn.html(originalHtml).css('background-color', '').prop('disabled', false);                        
        }, 800);
    });

    $('.btn-direct-buy').click(function() {
    	// 🚩 檢查是否登入
    	const loginUser = localStorage.getItem('loginUser');
    	if (!loginUser) {
        $('#login-modal').css('display', 'flex'); 
        return; // 攔截，不往下執行
    }
        const qty = parseInt($('.qty-input').val()) || 1;
        saveToCart(qty);
        window.location.href = 'cart.html';
    });
	
	// 🚩 彈窗控制邏輯
    $(document).on('click', '#btn-go-login', function() {
        window.location.href = 'login.html';
    });

    $(document).on('click', '#btn-close-modal', function() {
        $('#login-modal').hide();
    });
	
	
	// 🚩 修改：點擊右上方購物車時的攔截邏輯
    $('.cart-status').click(function(e) {
        const loginUser = localStorage.getItem('loginUser');
        if (!loginUser) {
            e.preventDefault(); // 阻止跳轉
            $('#login-modal').css('display', 'flex'); // 顯示請先登入彈窗
        } else {
            window.location.href = 'cart.html'; // 已登入則正常跳轉
        }
    });
    
    // --- 🚩 整合售完邏輯的渲染函數 ---
    function renderProduct(data) {
        const stock = data.stock || 0;
        const isOutOfStock = stock <= 0;
        const price = data.price || 0;

        // 處理售完視覺效果與按鈕
        if (isOutOfStock) {
            $('.main-container').addClass('sold-out');
            $('.btn-add-cart').prop('disabled', true).text('商品已售完');
            $('.btn-direct-buy').prop('disabled', true).text('無法購買');
            $('.qty-input').val(0).prop('disabled', true);
        } else {
            $('.main-container').removeClass('sold-out');
            $('.btn-add-cart').prop('disabled', false);
            $('.btn-direct-buy').prop('disabled', false);
            $('.qty-input').val(1).prop('disabled', false);
        }

        // 原本的渲染邏輯
        $('#render-title').html(`${data.title || '無標題'}`);
        $('#render-capacity').text(data.category || "家電");
        $('#render-market-price').text(`$ ${(price * 1.2).toLocaleString()}`);
        $('#render-current-price').text(price.toLocaleString());
        $('#render-brand').text("LifeStyle");
        $('#render-warranty').text("一年期保固");
        // 🚩 新增：渲染庫存數量並根據數量改變顏色
	    const $stockDisplay = $('#render-stock');
    	$stockDisplay.text(stock);
    	if (stock <= 5) {
        	$stockDisplay.css('color', 'red').css('font-weight', 'bold');
 		} else {
    	    $stockDisplay.css('color', '').css('font-weight', '');
	    }
        
        
        
        $('#render-features').html(`<li>${data.description || '暫無產品描述'}</li>`);

        const imgPath = data.imageUrl || 'static/images/default.png';
        $('#mainImage').attr('src', imgPath);
    }

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