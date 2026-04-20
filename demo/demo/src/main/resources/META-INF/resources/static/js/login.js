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
                
                showToast("登入成功！正在導向首頁...", "success");

                
                // 直接將後端回傳的完整物件（包含 email）存入 localStorage
                localStorage.setItem('loginUser', JSON.stringify(response));
                
                // 保留原本的 userRole 儲存，供其他頁面判斷權限使用
                localStorage.setItem('userRole', response.role);

                // 延遲 1 秒跳轉
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
                          
                if (xhr.status === 403) {
                    showToast("錯誤次數過多，帳號已被鎖定，請至忘記密碼重新設定", "error");
                } else if (xhr.status === 401 || xhr.status === 404) {
                    showToast("電子信箱或密碼錯誤", "error");
                } else {
                    showToast("伺服器連線異常，請稍後再試", "error");
                }                                                
            }
        });
    });

    /**
     * 顯示吐司訊息 (Toast)
     */
    function showToast(msg, type) {
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