$(document).ready(function() {
    
    // 整合：將原本的驗證按鈕邏輯改為發送重設郵件
    $("#btn-verify").click(function() {
        const email = $("#email").val().trim();
        const $btn = $(this);

        if (!email) {
            showToast("請先輸入電子信箱", "error");
            return;
        }

        // 鎖定按鈕防止重複點擊，並給予視覺回饋
        $btn.prop("disabled", true).text("處理中...");

        $.ajax({
            url: "/api/auth/forgot-password", // 呼叫後端寄送重設信的 API
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify({ email: email }),
            success: function(response) {
                showToast("重設連結已寄至您的信箱，請於 30 分鐘內點擊", "success");
                
                // 視覺回饋：變更按鈕樣式與狀態
                $btn.text("已寄送").css("background-color", "#2ecc71");
                $("#email").prop("readonly", true);  
                
                // 注意：因為現在要改去信箱點連結，所以原本的 #password-fields 不會在當前頁面顯示
            },
            error: function(xhr) {
                // 讀取後端回傳的錯誤訊息（例如：找不到帳號）
                const errorMsg = xhr.responseText || "系統錯誤，請稍後再試";
                showToast(errorMsg, "error");
                
                $btn.text("發送失敗").css("background-color", "#e74c3c");
                
                // 2秒後恢復按鈕，允許使用者重新嘗試
                setTimeout(() => {
                    $btn.prop("disabled", false).text("再試一次").css("background-color", "");
                }, 2000);
            }
        });
    });

    // 🚩 注意：原本的 $("#forgotForm").submit 邏輯會移到新頁面 (reset-password.html) 處理
    // 因為使用者點擊連結後，會在那個新頁面才看到密碼輸入框。

    function showToast(msg, type) {
        const toast = $("#message-toast");
        toast.text(msg).removeClass("toast-hidden toast-success toast-error");
        toast.addClass(type === "success" ? "toast-success" : "toast-error").addClass("toast-show");
        setTimeout(() => {
            toast.removeClass("toast-show").addClass("toast-hidden");
        }, 3000);
    }
});