$(document).ready(function() {
    $('#regForm').on('submit', function(e) {
        e.preventDefault();

        const username = $('#username').val().trim();
        const email = $('#email').val().trim();
        const password = $('#password').val();
        const confirmPassword = $('#confirmPassword').val();

        // 1. 前端初步格式檢查
        if (!email.includes("@") || !email.endsWith(".com")) {
            showToast("❌ 電子信箱格式錯誤", "error");
            return;
        }

        if (password !== confirmPassword) {
            showToast("❌ 密碼不一致", "error");
            return;
        }

        // 2. 準備傳送資料
        const regData = {
            username: username,
            email: email,
            password: password,
            confirmPassword: confirmPassword
        };

        // 3. 發送 AJAX
        $.ajax({
            url: '/api/auth/register',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(regData),
            success: function(res) {
                showToast("✅ " + res.message, "success");
            },
            error: function(xhr) {
                const msg = xhr.responseJSON ? xhr.responseJSON.message : "註冊失敗";
                showToast("❌ " + msg, "error");
            }
        });
    });

    function showToast(msg, type) {
        const $toast = $('#message-toast');
        $toast.text(msg).removeClass('toast-hidden toast-success toast-error').addClass('toast-show');
        $toast.addClass(type === 'error' ? 'toast-error' : 'toast-success');
        setTimeout(() => { $toast.removeClass('toast-show').addClass('toast-hidden'); }, 3000);
    }
});