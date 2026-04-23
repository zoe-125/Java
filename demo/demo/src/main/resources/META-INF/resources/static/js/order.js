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
                const formattedPrice = ord.totalAmount ? ord.totalAmount.toLocaleString() : 0;
                const orderDate = new Date(ord.createdAt).toLocaleString();
                
                // 狀態處理
                let statusText = ord.status === 'PENDING' ? "處理中" : "已完成";
                let statusClass = ord.status === 'PENDING' ? "status-pending" : "status-complete";

                // --- 🚩 圖片與名稱處理區 ---
                const hasItems = ord.items && ord.items.length > 0;
                
                // 讀取資料庫存的 "/uploads/..." 路徑
                const imgPath = (hasItems && ord.items[0].imageUrl) 
                                ? ord.items[0].imageUrl 
                                : '/static/images/default-product.png';

                const firstItemName = hasItems ? ord.items[0].productName : '多樣商品';
                const itemCount = hasItems ? ord.items.length : 0;

                // 產生卡片 HTML
                // 🚩 修改點：這裡改用 ord.phone 以對應你的 Java DTO 變數名
                const orderCard = `
                    <div class="order-card" onclick="openOrderDetail('${ord.orderNumber}', '${ord.receiverName}', '${ord.phone}', '${ord.shippingAddress}')">
                        <div class="order-main-info">
                            <img src="${imgPath}" class="order-img" onerror="this.src='/static/images/default-product.png'">
                            <div class="product-detail">
                                <div class="product-name">${firstItemName} ${itemCount > 1 ? '等商品' : ''}</div>
                                <div class="product-qty">共 ${itemCount} 件項目 | 下單時間：${orderDate}</div>
                            </div>
                            <div class="order-price-group">
                                <div class="order-price">$${formattedPrice}</div>
                                <span class="status-badge ${statusClass}">${statusText}</span>
                            </div>
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