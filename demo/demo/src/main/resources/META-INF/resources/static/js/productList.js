$(document).ready(function() {
    
    // 🚩 1. 統一狀態獲取：每次需要判斷時才現場抓取，保證 100% 準確
    function getLoginStatus() {
        return {
            user: localStorage.getItem('loginUser'),
            role: localStorage.getItem('userRole')
        };
    }

    // --- 🚩 2. 功能 A：更新導航列 UI (整合模板替換邏輯) ---
    function updateAuthUI() {
        const auth = getLoginStatus();
        if (!auth.user) return; // 如果沒登入，就維持 HTML 原狀(註冊/登入)

        // 1. 取得導航列容器與模板 (對應 HTML 裡的 id)
        const $container = $('#auth-links-container');
        const template = document.getElementById('tpl-nav-auth');
        
        if (!template) return;

        // 2. 實例化模板內容
        const clone = template.content.cloneNode(true);

        // 3. 處理名字顯示
        let displayName = auth.user;
        try {
            // 如果 auth.user 是像 {"id":7, "username":"陳小姐"...} 的 JSON 字串
            const userObj = JSON.parse(auth.user);
            displayName = userObj.username; // 只取出名字部分
        } catch (e) {
            // 如果解析失敗（代表裡面是舊的純字串格式），則維持原樣
            console.log("導航列顯示：使用純字串格式");
        }

        // 4. 填充模板內的歡迎訊息
        $(clone).find('.welcome-msg').text(`您好，${displayName}`).css({
            "color": "#e5004f",
            "font-weight": "bold",
            "margin-right": "10px"
        });

        // 5. 處理管理員「商品上架」入口
        if (auth.role === 'ADMIN') {
            $(clone).find('#admin-entry').html(`
                <a href="admin.html" style="color: #e67e22; font-weight: bold;">
                    <i class="fas fa-plus-circle"></i> 後台管理
                </a>
                <span style="color:#ccc; margin:0 10px;">|</span>
            `);
        }

        // 6. 關鍵動作：清空舊的「註冊/登入」，換成新的「歡迎/登出/會員中心」
        $container.empty().append(clone);
        
        // 🚩 因為 HTML 被重造了，需要重新同步一次購物車數量
        updateCartCount();
    } 
    
    // --- 3. 功能 B：渲染商品 (確保 data-id 屬性正確) ---
    function fetchAndRenderProducts() {
        $.ajax({
            url: '/api/products', 
            method: 'GET',
            success: function(products) {
                const $list = $('#product-list');
                $list.empty(); 

                if (!products || products.length === 0) {
                    $list.html('<p style="text-align:center; width:100%;">目前沒有商品上架中</p>');
                    return;
                }

                const template = document.getElementById('tpl-product-card');

                products.forEach(product => {
                	
                	if (product.status === '已下架') {
                        return; 
                    }
                
                    const clone = template.content.cloneNode(true);
                    const $card = $(clone).find('.product-card');
                    
                    // 寫入商品 ID 到屬性中
                    $card.attr('data-id', product.id);
                    $card.find('.product-img').attr('src', product.imageUrl || 'static/images/default.png');
                    $card.find('.product-title').text(product.title);
                    $card.find('.product-description').text(product.description || '');

                    const $priceArea = $card.find('.price-display-area');
                    if (product.stock <= 0) {
                        $card.addClass('sold-out');
                        $priceArea.html('<p style="color:red; font-weight:bold;">⚠️ 已售完</p>');
                    } else {
                        $priceArea.html(`<p class="product-price">單價：$${product.price.toLocaleString()}</p>`);
                    }

                    $list.append($card);
                });
                
                // 如果所有商品都被過濾掉了，顯示提示文字
                if ($list.children().length === 0) {
                    $list.html('<p style="text-align:center; width:100%;">目前沒有商品上架中</p>');
                }
            }
        });
    }

    // --- 4. 功能 C：更新購物車數量 ---
    function updateCartCount() {
        const auth = getLoginStatus();
        const cartKey = `myCart_${auth.user || 'guest'}`;
        let cart = JSON.parse(localStorage.getItem(cartKey)) || [];
        $('#cart-count').text(cart.reduce((sum, item) => sum + item.qty, 0));
    }

    // --- 5. 事件監聽 ---
    
    // 購物車攔截
    $(document).on('click', '.cart-link', function(e) {
        const auth = getLoginStatus();
        if (!auth.user) {
            e.preventDefault(); 
            e.stopPropagation(); 
            $('#login-modal').css('display', 'flex'); 
        }
    });

    // 商品卡片跳轉
    $(document).on('click', '.product-card', function(e) {
        e.preventDefault();
        e.stopPropagation(); 
        
        const productId = $(this).attr('data-id'); 
        if (productId) {
            window.location.href = `product.html?id=${productId}`;
        }
    });

    // 其他 UI 控制
    $(document).on('click', '#btn-go-login', function() { window.location.href = 'login.html'; });
    $(document).on('click', '#btn-close-modal', function() { $('#login-modal').hide(); });
    $(document).on('click', '#btnLogout', function(e) { 
        e.preventDefault(); 
        $('#logout-confirm-modal').css('display', 'flex'); 
    });
    $(document).on('click', '#btn-logout-submit', function() { 
        localStorage.removeItem('loginUser'); 
        localStorage.removeItem('userRole'); 
        location.reload(); 
    });
    $(document).on('click', '#btn-logout-cancel', function() { $('#logout-confirm-modal').hide(); });

    // --- 6. 啟動 ---
    updateAuthUI();           
    fetchAndRenderProducts(); 
    updateCartCount(); 
});