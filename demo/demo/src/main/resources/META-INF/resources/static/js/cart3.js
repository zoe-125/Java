$(document).ready(function() {
    // --- 1. 動態取得專屬 Key ---
    // 取得當前登入者名稱，若沒登入則預設為 guest
    const currentUser = localStorage.getItem('loginUser') || 'guest';
    const cartKey = `myCart_${currentUser}`; // 例如: myCart_aslo2
    
    // 從專屬 Key 中讀取資料
    let cartData = JSON.parse(localStorage.getItem(cartKey)) || [];
    
    const shippingFee = 100; // 運費
    const discountAmount = 200; // 活動折抵金額

    // 🚩 記錄待刪除的商品索引
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
                        
            // 重點：當購物車為空時，隱藏個人資訊區與訂單摘要            
            $('.cart-summary').hide();
                    
            localStorage.removeItem(cartKey);
        } else {
            // 重點：當購物車有東西時，顯示個人資訊區與訂單摘要
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

    // --- 4. 刪除彈窗事件 ---
    $(document).on('click', '.item-remove', function() {
        tempDeleteIndex = $(this).closest('.cart-item').data('index');
        $('#delete-modal').css('display', 'flex');
    });

    $('#btn-confirm-delete').on('click', function() {
        if (tempDeleteIndex !== null) {
            cartData.splice(tempDeleteIndex, 1);
            renderCart();
            $('#delete-modal').hide();
            tempDeleteIndex = null;
        }
    });

    $('#btn-cancel-delete').on('click', function() {
        $('#delete-modal').hide();
        tempDeleteIndex = null;
    });

    // --- 5. 結帳功能整合 (呼叫後端綠界 API) ---
    $('.btn-checkout').on('click', function() {
        // 先確認購物車內是否有商品
        if (cartData.length === 0) {
            alert('您的購物車是空的喔！');
            return;
        }
        
        // 準備發送給後端的資料
        // 將商品名稱串接 (格式: 商品A x1#商品B x2)
        let itemNames = cartData.map(item => `${item.name} x${item.qty}`).join('#');
        
        // 取得結帳總額 (移除 $ 與 , 符號，確保只傳數字)
        let totalAmount = $('#finalTotal').text().replace(/[^0-9]/g, '');

        // 發送 AJAX 到 Spring Boot Controller
        $.ajax({
            url: '/payment/checkout', 
            method: 'POST',
            data: {
                itemName: itemNames,
                totalAmount: totalAmount
            },
            success: function(response) {
                // 成功取得綠界表單後，清空該使用者的購物車
                localStorage.removeItem(cartKey);
                
                var $form = $('<form>', {
       			 	action: 'https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5',
       			 	method: 'post'
    			});
                
                // 3. 將後端回傳的所有 JSON 參數塞進 input
    			$.each(response, function(key, value) {
        			$form.append($('<input>', {
            		type: 'hidden',
            		name: key,
            		value: value
        		}));
			});
              	// 4. 將 Form 加入頁面並提交
 			   $('body').append($form);
    				console.log("正在前往綠界支付頁面...");
   			 		$form.submit();
			},
			error: function(xhr) {
    			alert("結帳請求失敗，請檢查後端控制台 log");
			}                                            
        });
    });
	
    // --- 6. 數量增減事件監聽 ---
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