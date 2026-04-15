$(document).ready(function() {
    let isEmailVerified = false;

    // 1. 點擊驗證按鈕
    $("#btn-verify").click(function() {
        const email = $("#email").val().trim();
        if (!email) {
            showToast("請先輸入電子信箱", "error");
            return;
        }

        $.ajax({
            url: "/api/auth/verify-email", // 🚩 需在後端新增此 API
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify({ email: email }),
            success: function(response) {
                // 假設後端找到人回傳成功
                showToast("驗證成功！請設定新密碼", "success");
                $("#btn-verify").text("驗證成功").prop("disabled", true).css("background-color", "#2ecc71");
                $("#email").prop("readonly", true); // 鎖定 Email 不可再改
                $("#password-fields").fadeIn(); // 顯示密碼欄位
                isEmailVerified = true;
            },
            error: function(xhr) {
                showToast("驗證失敗：找不到此帳號", "error");
                $("#btn-verify").text("驗證失敗").css("background-color", "#e74c3c");
                // 2秒後恢復按鈕文字供重新嘗試
                setTimeout(() => {
                    $("#btn-verify").text("驗證").css("background-color", "");
                }, 2000);
            }
        });
    });

    // 2. 提交表單 (重設密碼)
    $("#forgotForm").submit(function(e) {
        e.preventDefault();
        
        if (!isEmailVerified) {
            showToast("請先完成電子信箱驗證", "error");
            return;
        }

        const newPassword = $("#newPassword").val();
        const confirmPassword = $("#confirmPassword").val();

        if (newPassword.length < 6) {
            showToast("密碼長度不足", "error");
            return;
        }
        if (newPassword !== confirmPassword) {
            showToast("兩次密碼輸入不一致", "error");
            return;
        }

        $.ajax({
            url: "/api/auth/reset-password", // 🚩 呼叫剛才 Service 寫的解鎖 API
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify({
                email: $("#email").val(),
                password: newPassword
            }),
            success: function(response) {
                showToast("密碼重設成功！即將跳轉登入頁", "success");
                setTimeout(() => {
                    window.location.href = "/login.html";
                }, 2000);
            },
            error: function() {
                showToast("系統忙碌中，請稍後再試", "error");
            }
        });
    });

    function showToast(msg, type) {
        const toast = $("#message-toast");
        toast.text(msg).removeClass("toast-hidden toast-success toast-error");
        toast.addClass(type === "success" ? "toast-success" : "toast-error").addClass("toast-show");
        setTimeout(() => toast.removeClass("toast-show").addClass("toast-hidden"), 3000);
    }
});