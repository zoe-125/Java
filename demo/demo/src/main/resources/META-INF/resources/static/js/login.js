$(document).ready(function() {
    
    // 當登入表單送出時執行
    $("#loginForm").submit(function(event) {
        event.preventDefault(); // 防止頁面跳轉

        // 1. 取得並清理輸入值
        const email = $("#email").val().trim();
        const password = $("#password").val();

        // 2. 前端基礎檢查
        if (!email || !password) {
            showToast("請輸入電子信箱與密碼", "error");
            return;
        }

        // 3. 準備發送給後端的資料 (LoginRequest DTO)
        const loginData = {
            email: email,
            password: password
        };

        // 4. 發送 AJAX 請求
        $.ajax({
            url: "/api/auth/login",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify(loginData),
            success: function(response) {
                // response 包含: username, isAdmin, status
                showToast("登入成功！正在導向首頁...", "success");

                // 存入 localStorage 供全站/首頁 UI 判斷
                localStorage.setItem('loginUser', response.username);
                
                // 🚩 修正：直接存入後端回傳的 userRole (ADMIN 或 USER)
    			// 這樣你在資料庫改成 ADMIN，這裡拿到的就是 ADMIN
    			localStorage.setItem('userRole', response.userRole);
                
                //可能刪除 🚩 關鍵：將後端布林值轉為 ADMIN 或 USER 字串
                //可能刪除const role = response.isAdmin ? 'ADMIN' : 'USER';
                //可能刪除localStorage.setItem('userRole', role);

                // 延遲 1 秒跳轉，讓使用者看清楚成功提示
                setTimeout(() => {
                    window.location.href = "/index.html";
                }, 1000);
            },
            error: function(xhr, status, error) {
                // 【關鍵診斷區】
                console.error("===== 登入失敗診斷資訊 =====");
                console.error("狀態碼 (Status):", xhr.status);
                console.error("錯誤原因 (Error):", error);
                console.error("後端詳細報錯 (Response):", xhr.responseText);
                console.error("============================");
                          
                // 🚩 新增判斷邏輯
                if (xhr.status === 403) {
                    // 假設後端在次數超過時回傳 403 狀態碼
                    showToast("錯誤次數過多，帳號已被鎖定，請聯繫管理員", "error");
                } else if (xhr.status === 401 || xhr.status === 404) {
                    // 為了安全，統一顯示模糊訊息
                    showToast("電子信箱或密碼錯誤", "error");
                } else {
                    showToast("伺服器連線異常，請稍後再試", "error");
                }                                                
            }
        });
    });

    /**
     * 顯示吐司訊息 (Toast) - 與 Register 邏輯完全一致
     */
    function showToast(msg, type) {
        // 確保你的 login.html 裡有 <div id="message-toast" class="toast-hidden"></div>
        const toast = $("#message-toast");
        
        toast.text(msg);
        toast.removeClass("toast-hidden toast-success toast-error");
        
        if (type === "success") {
            toast.addClass("toast-success");
        } else {
            toast.addClass("toast-error");
        }

        toast.addClass("toast-show");

        setTimeout(() => {
            toast.removeClass("toast-show").addClass("toast-hidden");
        }, 3000);
    }
});