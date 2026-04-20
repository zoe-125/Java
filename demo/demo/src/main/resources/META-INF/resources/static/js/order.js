$(document).ready(function() {
    // 1. 取得登入資訊
    const loginUser = JSON.parse(localStorage.getItem('loginUser'));
    
    if (!loginUser) {
        alert("請先登入");
        window.location.href = "login.html";
        return;
    }

    // 2. 顯示會員資訊 (直接從 localStorage 拿)
    $('#display-username').text(loginUser.username || "訪客");
    $('#display-email').text(loginUser.email || "未設定");

    // 3. 向後端請求訂單列表
    // 注意：路徑要和你剛剛在瀏覽器測試成功的 member/7 一致
    $.ajax({
        url: `/api/orders/member/${loginUser.id}`,
        method: 'GET',
        success: function(orders) {
            console.log("抓取的訂單資料：", orders);
            const $container = $('#order-list-container');
            $container.empty();

            // 如果沒有訂單
            if (!orders || orders.length === 0) {
                $container.html(`
                    <div style="text-align:center; padding: 40px;">
                        <p style="color:#888;">目前尚無訂單紀錄</p>
                        <a href="index.html" class="continue-shopping" style="display:inline-block; margin-top:10px;">
                            去逛逛商品吧！
                        </a>
                    </div>
                `);
                return;
            }

            // 有訂單，開始跑迴圈
            orders.forEach(ord => {
                // 優化 A: 處理金額千分位 (36000 -> 36,000)
                const formattedPrice = ord.totalAmount.toLocaleString();
                
                // 優化 B: 處理時間格式
                const orderDate = new Date(ord.createdAt).toLocaleString();

                // 優化 C: 根據狀態給不同顏色 (需要在 CSS 定義 class)
                let statusText = "";
                let statusClass = "";
                if(ord.status === 'PENDING') {
                    statusText = "處理中";
                    statusClass = "status-pending"; // 可以在 CSS 設定橘色
                } else {
                    statusText = "已完成";
                    statusClass = "status-complete"; // 可以在 CSS 設定綠色
                }

                $container.append(`
                    <div class="cart-item">
                        <div class="item-info">
                            <h4 style="color:#333;">訂單編號：${ord.orderNumber}</h4>
                            <p style="font-size:0.9rem; color:#666;">下單時間：${orderDate}</p>
                            <p style="font-size:0.9rem; color:#666;">收件地址：${ord.shippingAddress}</p>
                        </div>
                        <div class="item-price">
                            <span style="font-size:0.8rem; color:#888;">總額</span><br>
                            $${formattedPrice}
                        </div>
                        <div style="margin-left: 20px;">
                            <span class="status-badge ${statusClass}">${statusText}</span>
                        </div>
                    </div>
                `);
            });
        },
        error: function(err) {
            console.error("無法抓取訂單", err);
            $('#order-list-container').html('<p style="color:red;">資料載入失敗，請稍後再試</p>');
        }
    });
});
