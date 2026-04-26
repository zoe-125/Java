$(document).ready(function() {
    // 1. 取得登入資訊
    const loginUser = JSON.parse(localStorage.getItem('loginUser'));
    
    if (!loginUser) {
        alert("請先登入");
        window.location.href = "login.html";
        return;
    }

    // 2. 向後端請求訂單列表
    loadOrderHistory(loginUser.id);

    // 3. 綁定彈窗關閉事件
    $('#close-modal-x').on('click', function() {
        closeOrderModal();
    });

    $(window).on('click', function(event) {
        if ($(event.target).is('#order-detail-modal')) {
            closeOrderModal();
        }
    });
});

/**
 * 從資料庫載入訂單紀錄
 */
function loadOrderHistory(userId) {
    $.ajax({
        url: `/api/orders/member/${userId}`,
        method: 'GET',
        success: function(orders) {
            console.log("後端回傳資料內容：", orders); 
            const $container = $('#order-list-container');
            $container.empty();

            if (!orders || orders.length === 0) {
                $container.html(`
                    <div class="empty-order-msg">
                        <p>目前尚無訂單紀錄</p>
                        <a href="index.html" class="continue-shopping">去逛逛商品吧！</a>
                    </div>
                `);
                return;
            }

            orders.forEach(ord => {
            	const hasItems = ord.items && ord.items.length > 0;
                const formattedPrice = ord.totalAmount ? ord.totalAmount.toLocaleString() : 0;
                const orderDate = new Date(ord.createdAt).toLocaleString();
                const unitPrice = hasItems ? (ord.items[0].purchasePrice || 0) : 0;
                
                let statusText = ord.status === 'PENDING' ? "處理中" : "已完成";
                let statusClass = ord.status === 'PENDING' ? "status-pending" : "status-complete";
                

                // --- 🚩 整合後的圖片處理區 ---
                
                // 【修改點】直接嘗試讀取資料庫路徑欄位
                // 優先使用小駝峰 imageUrl，若無則用底線 image_url，都沒有則給空字串
                const imgPath = hasItems ? (ord.items[0].imageUrl || ord.items[0].image_url || "") : "";

                const firstItemName = hasItems ? ord.items[0].productName : '無商品名稱';                
                const formattedUnitPrice = unitPrice.toLocaleString();
                const totalQty = hasItems 
                    ? ord.items.reduce((sum, item) => sum + (item.quantity || 0), 0) 
                    : 0;

                const orderCard = `
                    <div class="order-card" onclick="openOrderDetail('${ord.orderNumber}', '${ord.receiverName}', '${ord.phone}', '${ord.shippingAddress}')">
                        <div class="order-header">
                            <span class="order-id-text">訂單編號：${ord.orderNumber}</span>
                            <span class="status-badge ${statusClass}">${statusText}</span>
                        </div>
                        
                        <div class="order-main-info">
                            <img src="${imgPath}" class="order-img">
                            
                            <div class="product-detail">
                                <div class="product-name">${firstItemName} ${ord.items.length > 1 ? '等商品' : ''}</div>
                                <div class="product-qty">x${totalQty}</div>
                                <div class="order-date">下單時間：${orderDate}</div>
                            </div>
                            
                            
                            <div class="order-price-group">
							    <div class="price-row" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 50px;">
							        <span></span> 
							        <span class="order-price" style="font-size: 0.95rem; color: #666;">$${formattedUnitPrice}</span>
							    </div>
							
							    <div class="price-row" style="display: flex; justify-content: space-between; align-items: center;">
							        <span class="order-total-label" style="font-weight: bold;font-size: 1.2rem;">訂單金額: </span>
							        <span class="order-price" style="color: #e44d26; font-weight: bold; font-size: 1.5rem;">$${formattedPrice}</span>
							    </div>
							</div>                                                                         
                        </div>

                        <div class="order-footer">
                            <button class="btn-again" onclick="event.stopPropagation(); alert('已加入購物車');">再次購買</button>
                        </div>
                    </div>
                `;
                $container.append(orderCard);
            });
        },
        error: function(err) {
            console.error("無法抓取訂單", err);
            $('#order-list-container').html('<p class="empty-order-msg" style="color:red;">資料載入失敗，請稍後再試</p>');
        }
    });
}

/**
 * 顯示訂單詳情彈窗
 */
function openOrderDetail(orderId, name, phone, address) {
    $('#detail-id').text(orderId);
    $('#detail-name').text(name || "未提供");
    $('#detail-phone').text(phone || "未提供");
    $('#detail-address').text(address || "未提供");
    
    $('#order-detail-modal').fadeIn(200).css('display', 'flex');
}

/**
 * 關閉訂單詳情彈窗
 */
function closeOrderModal() {
    $('#order-detail-modal').fadeOut(200);
}