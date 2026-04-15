$(document).ready(function() {
    
    // --- 1. 初始化狀態 ---
    const userRole = localStorage.getItem('userRole'); 
    const loginUser = localStorage.getItem('loginUser'); 

    // --- 2. 功能 A：更新導航列 (邏輯分離版) ---
    function updateAuthUI() {
        if (!loginUser) return; // 未登入則維持 HTML 預設狀態

        const $authLinks = $('.top-right-links');
        const template = document.getElementById('tpl-nav-auth');
        const clone = template.content.cloneNode(true);

        // 使用 .text() 填入，更安全 (防止 XSS)
        $(clone).find('.welcome-msg').text(`您好，${loginUser}`).css({
            "color": "#e5004f",
            "font-weight": "bold",
            "margin-right": "10px"
        });

        // 管理員權限判斷
        if (userRole === 'ADMIN') {
            const adminLinkHtml = `
                <a href="adminProduct.html" style="color: #e67e22; font-weight: bold;">
                    <i class="fas fa-plus-circle"></i> 商品上架管理
                </a>
                <span style="color:#ccc; margin:0 10px;">|</span>
            `;
            $(clone).find('#admin-entry').html(adminLinkHtml);
        }

        // 將填寫好的模板放回頁面
        $authLinks.html(clone);
    }

    // --- 3. 功能 B：渲染商品 (模板分離版) ---
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

                const template = document.getElementById('tpl-product-card');

                products.forEach(product => {
                    const clone = template.content.cloneNode(true);
                    const $card = $(clone).find('.product-card');
                    const isOutOfStock = product.stock <= 0;

                    // 填入基本資訊
                    $card.attr('data-id', product.id);
                    $card.find('.product-img').attr('src', product.imageUrl || 'static/images/default.png');
                    $card.find('.product-title').text(product.title);
                    $card.find('.product-description').text(product.description || '暫無描述');

                    // 處理價格/售完狀態
                    const $priceArea = $card.find('.price-display-area');
                    if (isOutOfStock) {
                        $card.addClass('sold-out');
                        $priceArea.html('<p style="color:red; font-weight:bold;">⚠️ 此商品已售完</p>');
                    } else {
                        $priceArea.html(`<p class="product-price">單價：$${product.price.toLocaleString()}</p>`);
                    }

                    $list.append($card);
                });
            },
            error: function(err) {
                console.error("無法取得商品資料:", err);
                $('#product-list').html('<p style="color:red; text-align:center;">伺服器連線失敗，無法載入商品</p>');
            }
        });
    }

    // --- 4. 功能 C：更新購物車數量 ---
    function updateCartCount() {
        const currentUser = localStorage.getItem('loginUser') || 'guest';
        const cartKey = `myCart_${currentUser}`;
        let cart = JSON.parse(localStorage.getItem(cartKey)) || [];
        let total = cart.reduce((sum, item) => sum + item.qty, 0);
        $('#cart-count').text(total);
    }

    // --- 5. 事件監聽 (維持原本所有功能) ---
    
    // 購物車跳轉攔截
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

    // 登出流程
    $(document).on('click', '#btnLogout', function(e) {
        e.preventDefault();
        $('#logout-confirm-modal').css('display', 'flex');
    });
    
    $(document).on('click', '#btn-logout-submit', function() {
        localStorage.removeItem('loginUser');
        localStorage.removeItem('userRole'); 
        location.reload();   
    });
    
    $(document).on('click', '#btn-logout-cancel', function() {
        $('#logout-confirm-modal').hide();
    });

    // 點擊卡片跳轉詳情
    $(document).on('click', '.product-card', function() {
        const productId = $(this).data('id');
        if (productId) {
            window.location.href = `product.html?id=${productId}`;
        }
    });

    // --- 6. 程式啟動 ---
    updateAuthUI();           
    fetchAndRenderProducts(); 
    updateCartCount(); 
});