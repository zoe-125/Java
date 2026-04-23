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
                updateCartCount(); 
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
        if (!window.currentProduct || window.currentProduct.stock <= 0) return; 
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

    // --- 5. 檢查並切換「已達到購買上限」提示 ---
    function checkStockWarning(val) {
        const stock = window.currentProduct ? window.currentProduct.stock : 0;
        if (val >= stock && stock > 0) {
            $('#stock-warning').show().text('已達到購買上限');
        } else {
            $('#stock-warning').hide();
        }
    }

    // --- 6. 核心攔截邏輯 (使用自定義 Modal 取代 alert) ---
    function validateAndProcess(qty, callback) {
        const loginUser = localStorage.getItem('loginUser');
        if (!loginUser) {
            $('#login-modal').css('display', 'flex'); 
            return; 
        }    

        const cartKey = getCartKey();
        let cart = JSON.parse(localStorage.getItem(cartKey)) || [];
        const existingItem = cart.find(item => item.id === window.currentProduct.id);
        const currentInCart = existingItem ? existingItem.qty : 0;

        if (currentInCart + qty > window.currentProduct.stock) {
            const msg = `無法將所選數量加到購物車。因為購物車已有 ${currentInCart} 件商品，請至購物車頁面查看。`;
            $('#stock-modal-message').text(msg);
            $('#stock-modal').css('display', 'flex'); 
            return;
        }

        saveToCart(qty); 
        updateCartCount();
        if (callback) callback();
    }

    // --- 事件處理 ---
    
    $('.plus').click(function() {
        let val = parseInt($('.qty-input').val());
        const stock = window.currentProduct ? window.currentProduct.stock : 0;
        
        if (val < stock) {
            const nextVal = val + 1;
            $('.qty-input').val(nextVal);
            checkStockWarning(nextVal);
            updateTotal();
        } else {
            showToast(`抱歉，庫存僅剩 ${stock} 件`, "error");
        }
    });

    $('.minus').click(function() {
        let val = parseInt($('.qty-input').val());
        if (val > 1) {
            const nextVal = val - 1;
            $('.qty-input').val(nextVal);
            checkStockWarning(nextVal);
            updateTotal();
        }
    });
    
    $('.qty-input').on('input change', function() {
        let val = parseInt($(this).val());
        const stock = window.currentProduct ? window.currentProduct.stock : 0;

        if (val > stock) {
            $(this).val(stock);
            val = stock;
        } else if (isNaN(val) || val < 1) {
            $(this).val(1);
            val = 1;
        }
        checkStockWarning(val);
        updateTotal();
    });

    $('.btn-add-cart').click(function() {
        const qty = parseInt($('.qty-input').val()) || 1;
        const $btn = $(this);
        const originalHtml = $btn.html();

        validateAndProcess(qty, function() {
            $btn.html('<i class="fas fa-check"></i> 已加入！').css('background-color', '#28a745').prop('disabled', true);
            setTimeout(() => {
                $btn.html(originalHtml).css('background-color', '').prop('disabled', false);                        
            }, 800);
        });
    });

    $('.btn-direct-buy').click(function() {
        const qty = parseInt($('.qty-input').val()) || 1;
        validateAndProcess(qty, function() {
            window.location.href = 'cart.html';
        });
    });

    // 關閉自定義彈窗
    $(document).on('click', '#btn-close-stock-modal', function() {
        $('#stock-modal').hide();
    });

    $(document).on('click', '#btn-go-login', function() {
        window.location.href = 'login.html';
    });

    $(document).on('click', '#btn-close-modal', function() {
        $('#login-modal').hide();
    });
	
    $('.cart-status').click(function(e) {
        const loginUser = localStorage.getItem('loginUser');
        if (!loginUser) {
            e.preventDefault(); 
            $('#login-modal').css('display', 'flex'); 
        } else {
            window.location.href = 'cart.html'; 
        }
    });
    
    function renderProduct(data) {
        const stock = data.stock || 0;
        const isOutOfStock = stock <= 0;
        const price = data.price || 0;

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

        $('#render-title').html(`${data.title || '無標題'}`);
        $('#render-capacity').text(data.category || "家電");
        $('#render-market-price').text(`$ ${(price * 1.2).toLocaleString()}`);
        $('#render-current-price').text(price.toLocaleString());
        $('#render-brand').text("LifeStyle");
        $('#render-warranty').text("一年期保固");

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
        
        // 渲染後初始檢查警告文字
        checkStockWarning(parseInt($('.qty-input').val()));
    }

    function updateCartCount() {
        const cartKey = getCartKey(); 
        let cart = JSON.parse(localStorage.getItem(cartKey)) || [];
        let total = cart.reduce((sum, item) => sum + item.qty, 0);
        $('#cart-count').text(total); 
    }
    
    function showToast(msg, type) {
	    const $toast = $("#message-toast");
	    if ($toast.length === 0) {
            alert(msg);
	        return; 
	    }
	    $toast.text(msg).removeClass("toast-hidden toast-success toast-error toast-show");
	    const typeClass = (type === "success") ? "toast-success" : "toast-error";
	    $toast.addClass(typeClass).addClass("toast-show");
	    setTimeout(() => {
	        $toast.removeClass("toast-show").addClass("toast-hidden");
	    }, 2000);
	}

    $(document).on('click', '.thumb', function() {
        $('#mainImage').attr('src', $(this).attr('src'));
        $('.thumb').removeClass('active');
        $(this).addClass('active');
    });
});