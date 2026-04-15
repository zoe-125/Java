$(document).ready(function() {
    
    // --- 🚩 權限與狀態初始化 ---
    const userRole = localStorage.getItem('userRole'); 
    const loginUser = localStorage.getItem('loginUser'); 

    // --- 功能 A：檢查登入狀態並更新導航列 ---
    function updateAuthUI() {
        const $authLinks = $('.top-right-links'); 

        if (loginUser) {
            let adminHtml = (userRole === 'ADMIN') 
                ? `<span id="admin-menu"><a href="adminProduct.html" style="color: #e67e22; font-weight: bold;"><i class="fas fa-plus-circle"></i> 商品上架管理</a><span style="color:#ccc; margin:0 10px;">|</span></span>` 
                : '';

            $authLinks.html(`
                ${adminHtml}
                <span style="color: #e5004f; font-weight: bold;">您好，${loginUser}</span>                
                <a href="#" id="btnLogout">登出</a>
                <a href="#.html">會員中心</a>
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
                    // 🚩 整合：判斷是否售完
                    const isOutOfStock = product.stock <= 0;

                    // 🚩 整合：動態價格/售完顯示
                    const priceDisplay = !isOutOfStock 
                        ? `<p class="product-price">單價：$${product.price.toLocaleString()}</p>` 
                        : `<p class="out-of-stock" style="color:red; font-weight:bold;">⚠️ 此商品已售完</p>`;
                    
                    const imgUrl = product.imageUrl || 'static/images/default.png';

                    // 🚩 整合：如果售完加一個 .sold-out 的 class
                    const cardHtml = `
                        <div class="product-card ${isOutOfStock ? 'sold-out' : ''}" data-id="${product.id}" style="cursor: pointer;">
                            <div class="card-img-wrapper">
                                <img src="${imgUrl}" alt="${product.title}" class="product-img">
                            </div>
                            <div class="product-info">
                                <h3 class="product-title">${product.title}</h3>
                                <p class="product-description">${product.description || '暫無描述'}</p>
                                ${priceDisplay}                                
                            </div>                                              
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

    // --- 功能 C：更新購物車數量 ---
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
    	const isLogin = localStorage.getItem('loginUser');
    	if (!isLogin) {
        	e.preventDefault(); // 阻止跳轉到 cart.html
        	$('#login-modal').css('display', 'flex'); // 顯示提示彈窗
    }
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
        // 只顯示彈窗，先不清除資料
    	$('#logout-confirm-modal').css('display', 'flex');
	});
	
	// 2. 點擊彈窗內的「確定」
	$(document).on('click', '#btn-logout-submit', function() {
    	// 執行登出動作
        localStorage.removeItem('loginUser');
        localStorage.removeItem('userRole'); 
        
        // 跳轉或重整頁面
    	location.reload();   
    });
    
	// 3. 點擊彈窗內的「取消」
	$(document).on('click', '#btn-logout-cancel', function() {
    	// 直接隱藏彈窗
    	$('#logout-confirm-modal').hide();
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
    updateCartCount(); 
});