$(document).ready(function() {
    // --- 1. 初始化資料 ---
    const currentUser = localStorage.getItem('loginUser') || 'guest';
    const cartKey = `myCart_${currentUser}`;
    let cartData = JSON.parse(localStorage.getItem(cartKey)) || [];
    
    const shippingFee = 100;
    const discountAmount = 200;
    let currentStep = 1; // 1: 購物車, 2: 填寫資料
    let tempDeleteIndex = null;

    renderCart();
	
    // --- 2. 渲染功能 ---
    function renderCart() {
        let itemsHtml = '';
        let subtotal = 0;

        if (cartData.length === 0) {
            $('#cartItemsList').html(`<div style="text-align:center; padding: 50px 0;"><p>您的購物車目前是空的</p></div>
            <a href="index.html" class="btn-direct-buy" 
               style="display:inline-block; width:auto; padding:10px 40px; 
               text-decoration:none; border-radius:30px;">回首頁選購商品</a>`);
            updateSummary(0);
            $('.cart-summary').hide();
            $('#checkoutInfo').hide(); 
            localStorage.removeItem(cartKey);
        } else {
            // 決定 UI 狀態
            if (currentStep === 1) {
                $('#checkoutInfo').hide(); 
                $('.btn-checkout').text('前往結帳');
            } else {
                $('#checkoutInfo').show();
                $('.btn-checkout').text('確認付款');
            }

            $('.cart-summary').show();
        	
            cartData.forEach((item, index) => {
                subtotal += item.price * item.qty;
                itemsHtml += `
                <div class="cart-item ${currentStep === 2 ? 'locked' : ''}" data-index="${index}">
                    <img src="${item.img}">
                    <div class="item-info">
                        <h4>${item.name}</h4>                        
                        <p>$${(item.price || 0).toLocaleString()}</p>
                        <div class="quantity-selector" style="margin-top:10px;">
                            <button class="qty-btn minus" ${currentStep === 2 ? 'disabled' : ''}>-</button>
                            <input type="number" class="qty-input" value="${item.qty}" readonly>
                            <button class="qty-btn plus" ${currentStep === 2 ? 'disabled' : ''}>+</button>
                        </div>
                    </div>
                    <div class="item-price">$${((item.price || 0) * item.qty).toLocaleString()}</div>
                    <div class="item-remove" style="${currentStep === 2 ? 'display:none' : ''}">
                        <i class="fas fa-trash-alt"></i>
                    </div>
                </div>`;
            });
            $('#cartItemsList').html(itemsHtml);
            updateSummary(subtotal);
            localStorage.setItem(cartKey, JSON.stringify(cartData));
        }
    }
	
    function updateSummary(subtotal) {
        const hasItems = subtotal > 0;
        const currentDiscount = hasItems ? discountAmount : 0;
        const total = hasItems ? Math.max(0, subtotal + shippingFee - currentDiscount) : 0;
        $('#subtotal').text(`$ ${subtotal.toLocaleString()}`);
        $('#shipping').text(`$ ${hasItems ? shippingFee : 0}`);
        $('#discount').text(`-$ ${currentDiscount.toLocaleString()}`); 
        $('#finalTotal').text(`$ ${total.toLocaleString()}`);
    }

    // --- 3. 事件監聽 (加入 currentStep 檢查防止繞過) ---
    $(document).on('click', '.item-remove', function() {
        if (currentStep === 2) return; // 鎖定狀態不可點擊
        tempDeleteIndex = $(this).closest('.cart-item').data('index');
        $('#delete-modal').css('display', 'flex');
    });

    $(document).on('click', '.plus', function() {
        if (currentStep === 2) return;
        const index = $(this).closest('.cart-item').data('index');
        cartData[index].qty++;
        renderCart();
    });

    $(document).on('click', '.minus', function() {
        if (currentStep === 2) return;
        const index = $(this).closest('.cart-item').data('index');
        if (cartData[index].qty > 1) { 
            cartData[index].qty--; 
            renderCart(); 
        }
    });

    // --- 4. 結帳與鎖定邏輯 ---
    $('.btn-checkout').on('click', function() {
        if (cartData.length === 0) return alert('您的購物車是空的');

        if (currentStep === 1) {
            // 切換至步驟 2：填寫資料
            currentStep = 2;
            
            // 重新渲染，這會觸發 HTML 標籤內的 disabled 與隱藏刪除鈕
            renderCart(); 

            $('#checkoutInfo').slideDown();
            $('#step2').addClass('active');
            $(this).text('確認付款');
            
            $('html, body').animate({ 
                scrollTop: $("#checkoutInfo").offset().top - 100 
            }, 500);

        } else if (currentStep === 2) {
            // --- 整合後的最終提交邏輯：從物件抓取專屬 ID ---
            const loginUserData = localStorage.getItem('loginUser');
            let loginUser = null;
            
            try {
                // 將存儲的 JSON 字串轉回物件
                loginUser = loginUserData ? JSON.parse(loginUserData) : null;
            } catch (e) {
                console.error("解析登入資料失敗", e);
            }

            // 檢查是否有登入且包含 ID
            if (!loginUser || !loginUser.id) {
                alert('請先登入會員才能結帳');
                window.location.href = 'login.html';
                return;
            }

            const checkoutData = {
                memberId: loginUser.id, // 使用專屬 ID
                receiverName: $('#receiverName').val(),
                receiverPhone: $('#receiverPhone').val(),
                receiverAddress: $('#receiverAddress').val(),
                items: cartData.map(item => ({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    qty: item.qty
                }))
            };

            if (!checkoutData.receiverName || !checkoutData.receiverPhone || !checkoutData.receiverAddress) {
                alert('請完整填寫收件人資訊');
                return;
            }

            // --- 呼叫後端 API ---
            fetch('/api/orders/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(checkoutData)
            })
            .then(response => {
                if (response.ok) {
                    alert('感謝您的訂購！訂單已成功送出。');
                    localStorage.removeItem(cartKey);
                    window.location.href = 'index.html';
                } else {
                    alert('訂單送出失敗，請檢查網路或聯繫客服');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('連線至伺服器時發生錯誤');
            });
        }
    });

    // 刪除彈窗的關閉邏輯
    $('#btn-confirm-delete').on('click', function() {
        if (tempDeleteIndex !== null) {
            cartData.splice(tempDeleteIndex, 1);
            renderCart();
            $('#delete-modal').hide();
            tempDeleteIndex = null;
        }
    });
    $('#btn-cancel-delete').on('click', function() { $('#delete-modal').hide(); });
});