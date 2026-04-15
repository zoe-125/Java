$(document).ready(function() {
    // --- 1. 動態取得專屬 Key ---
    // 取得當前登入者名稱，若沒登入則預設為 guest
    const currentUser = localStorage.getItem('loginUser') || 'guest';
    const cartKey = `myCart_${currentUser}`; // 例如: myCart_aslo2
    
    // 從專屬 Key 中讀取資料
    let cartData = JSON.parse(localStorage.getItem(cartKey)) || [];
    
    const shippingFee = 100; // 運費
    const discountAmount = 200; // 活動折抵金額

	// 🚩 新增：記錄待刪除的商品索引
    let tempDeleteIndex = null;

    renderCart();
	
	// --- 2. 核心渲染功能 ---
    function renderCart() {
        let itemsHtml = '';
        let subtotal = 0;

        if (cartData.length === 0) {
            $('#cartItemsList').html(`
        	<div style="text-align:center; padding: 50px 0;">
            	<p style="font-size: 1.2rem; color: #888;">您的購物車目前是空的喔！</p>
           		 <a href="index.html" class="btn" 
           		 style="display:inline-block; width:auto; padding:10px 30px; 
           		 margin-top:20px; text-decoration:none;">回首頁選購商品</a>
        	</div>`);
            
            updateSummary(0);
                        
  	      	//  重點：當購物車為空時，隱藏個人資訊區與訂單摘要
        	$('.checkout-info-section').hide();
    	    $('.cart-summary').hide();
                    
            //  這裡也要改用 cartKey,當資料清空時，同步移除該 Key
            localStorage.removeItem(cartKey);
        } else {
        	//  重點：當購物車有東西時，顯示個人資訊區與訂單摘要
        	$('.checkout-info-section').show();
        	$('.cart-summary').show();
        	
            cartData.forEach((item, index) => {
                subtotal += item.price * item.qty;
                itemsHtml += `
                <div class="cart-item" data-index="${index}">
                    <img src="${item.img}">
                    <div class="item-info">
                        <h4>${item.name}</h4>
                        <p>$${(item.price || 0).toLocaleString()}</p>
                        <div class="quantity-selector" style="margin-top:10px;">
                            <button class="qty-btn minus">-</button>
                            <input type="number" class="qty-input" value="${item.qty}" readonly>
                            <button class="qty-btn plus">+</button>
                        </div>
                    </div>
                    <div class="item-price">$${((item.price || 0) * item.qty).toLocaleString()}</div>
                    <div class="item-remove"><i class="fas fa-trash-alt"></i></div>
                </div>`;
            });
            $('#cartItemsList').html(itemsHtml);
            updateSummary(subtotal);
            
            // 🚩 同步回存至專屬的資料 Key
            localStorage.setItem(cartKey, JSON.stringify(cartData));
        }
    }
	
	// --- 3. 更新摘要金額 ---
    function updateSummary(subtotal) {
        const hasItems = subtotal > 0;
        const currentDiscount = hasItems ? discountAmount : 0;
        const total = hasItems ? Math.max(0, subtotal + shippingFee - currentDiscount) : 0;

        $('#subtotal').text(`$ ${subtotal.toLocaleString()}`);
        $('#shipping').text(`$ ${hasItems ? shippingFee : 0}`);
        $('#discount').text(`-$ ${currentDiscount.toLocaleString()}`); 
        $('#finalTotal').text(`$ ${total.toLocaleString()}`);
    }

	
	// 1. 點擊垃圾桶：顯示彈窗並記錄索引
    $(document).on('click', '.item-remove', function() {
        tempDeleteIndex = $(this).closest('.cart-item').data('index');
        $('#delete-modal').css('display', 'flex');
    });

    // 2. 點擊彈窗的「確定移除」
    $('#btn-confirm-delete').on('click', function() {
        if (tempDeleteIndex !== null) {
            cartData.splice(tempDeleteIndex, 1);
            renderCart();
            $('#delete-modal').hide();
            tempDeleteIndex = null;
        }
    });

    // 3. 點擊彈窗的「取消」
    $('#btn-cancel-delete').on('click', function() {
        $('#delete-modal').hide();
        tempDeleteIndex = null;
    });
	
	

	$('.btn-checkout').on('click', function() {
        // 先確認購物車內是否有商品
        if (cartData.length === 0) {
            alert('您的購物車是空的喔！');
            return;
        }
        // 簡單驗證資料是否填寫 (對應 HTML 中的個人資訊欄位)
        const phone = $('#phone').val();
        const address = $('#address').val();

        if (!phone || !address) {
            alert('請填寫收件電話與地址！');
            return;
        }

        // 這裡執行結帳成功後的邏輯
        alert('訂單已收到！感謝您的購買。');
        
        // 結帳成功後清空該使用者的購物車 Key
        localStorage.removeItem(cartKey);
        
        // 導向回首頁
        window.location.href = 'index.html'; 
    });
	
    // --- 事件監聽 ---
    $(document).on('click', '.plus', function() {
        const index = $(this).closest('.cart-item').data('index');
        cartData[index].qty++;
        renderCart();
    });

    $(document).on('click', '.minus', function() {
        const index = $(this).closest('.cart-item').data('index');
        if (cartData[index].qty > 1) { 
            cartData[index].qty--; 
            renderCart(); 
        }
    });

});

