$(document).ready(function() {
    // 1. 從 URL 取得 token 參數
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    // 初始化檢查：如果沒 token 就不准送出
    if (!token) {
        showToast("無效的連結，請重新從忘記密碼申請", "error");
        $("#btn-submit").prop("disabled", true);
    } else {
        $("#token").val(token);
    }

    // 2. 提交表單處理
    $("#resetPasswordForm").submit(function(e) {
        e.preventDefault();

        const newPassword = $("#newPassword").val();
        const confirmPassword = $("#confirmPassword").val();
        const $btn = $("#btn-submit");

        // 前端驗證
        if (newPassword.length < 8) {
            showToast("密碼長度至少需 8 位字元", "error");
            return;
        }
        if (newPassword !== confirmPassword) {
            showToast("兩次密碼輸入不一致", "error");
            return;
        }

        // 鎖定按鈕防止重複提交
        $btn.prop("disabled", true).text("修改中...");

        $.ajax({
            url: "/api/auth/do-reset-password",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify({
                token: $("#token").val(),
                password: newPassword
            }),
            success: function(response) {
                showToast("密碼重設成功！即將跳轉登入頁", "success");
                setTimeout(() => {
                    window.location.href = "/login.html";
                }, 2000);
            },
            error: function(xhr) {
                const errorMsg = xhr.responseText || "連結已過期或失效";
                showToast(errorMsg, "error");
                $btn.prop("disabled", false).text("確認修改");
            }
        });
    });

    /**
     * 吐司訊息提示
     */
    function showToast(msg, type) {
        const toast = $("#message-toast");
        toast.text(msg).removeClass("toast-hidden toast-success toast-error");
        
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