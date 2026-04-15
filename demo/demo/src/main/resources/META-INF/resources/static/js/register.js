$(document).ready(function() {
    
    // 當表單送出時執行
    $("#registerForm").submit(function(event) {
        event.preventDefault(); // 防止頁面跳轉

        // 1. 取得並清理輸入值
        const username = $("#username").val().trim();
        const email = $("#email").val().trim();
        const password = $("#password").val();
        const confirmPassword = $("#confirmPassword").val();

        // 2. 前端即時驗證邏輯
        if (!username || !email || !password || !confirmPassword) {
            showToast("所有欄位皆為必填！", "error");
            return;
        }

        // 簡單檢查 Email 格式 (基本的 Regex)
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            showToast("請輸入正確的 Email 格式", "error");
            return;
        }

        if (password.length < 6) {
            showToast("密碼長度至少需 6 位字元", "error");
            return;
        }

        if (password !== confirmPassword) {
            showToast("兩次輸入的密碼不一致", "error");
            return;
        }

        // 3. 準備發送給後端的資料 (DTO 格式)
        const signupData = {
            username: username,
            email: email,
            password: password,
            confirmPassword: confirmPassword
        };

        // 4. 發送 AJAX 請求
        $.ajax({
            url: "/api/auth/register",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify(signupData),
            success: function(response) {
                // 如果後端回傳的訊息包含「成功」
                if (response.includes("成功")) {
                	// 🚩 修改處：增加跳轉提示訊息
                    showToast(response + " 正在導向登入頁面...", "success");
                    
                    //showToast(response, "success");
                    // 成功後清空表單
                    $("#registerForm")[0].reset();
                    
                    // (選填) 3秒後導向登入頁或顯示提示
                     setTimeout(() => { window.location.href = "/login.html"; }, 1000);
                } else {
                    // 顯示後端傳回的錯誤邏輯訊息 (例如：Email 已被註冊)
                    showToast(response, "error");
                }
            },
            error: function(xhr, status, error) {
                // 【關鍵診斷區】
                // 當進入此區塊，代表後端發生 500 錯誤或連線失敗
                console.error("===== 註冊失敗診斷資訊 =====");
                console.error("狀態碼 (Status):", xhr.status);
                console.error("錯誤原因 (Error):", error);
                console.error("後端詳細報錯 (Response):", xhr.responseText);
                console.error("============================");

                // 提示使用者，並包含錯誤代碼方便對時
                showToast("系統忙碌中 (代碼:" + xhr.status + ")，請稍後再試或檢查信箱設定", "error");
            }
        });
    });

    /**
     * 顯示吐司訊息 (Toast)
     * @param {string} msg 訊息內容
     * @param {string} type 類型 ('success' 或 'error')
     */
    function showToast(msg, type) {
        const toast = $("#message-toast");
        
        // 設定內容與顏色
        toast.text(msg);
        toast.removeClass("toast-hidden toast-success toast-error");
        
        if (type === "success") {
            toast.addClass("toast-success");
        } else {
            toast.addClass("toast-error");
        }

        // 顯示動畫
        toast.addClass("toast-show");

        // 3秒後自動隱藏
        setTimeout(() => {
            toast.removeClass("toast-show").addClass("toast-hidden");
        }, 3000);
    }
});