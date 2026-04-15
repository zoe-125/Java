// ======================= script.js =======================
$(document).ready(function() {
    let cart = [];
    let total = 0;

    $('.add-to-cart').click(function() {
        let product = $(this).parent();
        let name = product.data('name');
        let price = parseInt(product.data('price'));

        cart.push({ name, price });
        total += price;

        $('#cart-count').text(cart.length);
        $('#total').text(total);

        $('#cart-list').append(`<li>${name} - $${price}</li>`);
    });
});









//最超級新的js


$(document).ready(function() {
    const API_BASE = 'http://localhost:9990/api/auth';
    let toastTimer; // 用來管理訊息消失的時間

    /**
     * 顯示自定義訊息橫幅
     * @param {string} text - 顯示文字
     * @param {string} type - 'success' 或 'error'
     */
    function showMessage(text, type = 'success') {
        const $toast = $('#message-toast');
        
        // 先清除之前的定時器，避免訊息閃爍或過快消失
        clearTimeout(toastTimer);

        $toast.text(text)
            .removeClass('toast-hidden toast-success toast-error')
            .addClass('toast-show toast-' + type);

        // 3秒後自動消失
        toastTimer = setTimeout(() => {
            $toast.removeClass('toast-show').addClass('toast-hidden');
        }, 3000);
    }

    // --- 會員註冊邏輯 ---
    $('#regForm').on('submit', function(e) {
        e.preventDefault();
        const $btn = $(this).find('button');
        
        const payload = {
            username: $('#name').val(),
            email: $('#email').val(),
            password: $('#password').val(),
            confirmPassword: $('#confirmPassword').val()
        };

        // 防止重複提交
        $btn.prop('disabled', true).text('處理中...');

        $.ajax({
            url: API_BASE + '/register',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(payload),
            success: function(res) {
                showMessage('註冊成功！', 'success');
                setTimeout(() => { 
                    window.location.href = 'login.html'; 
                }, 1500);
            },
            error: function(xhr) {
                const msg = xhr.responseJSON ? xhr.responseJSON.message : '系統忙碌中，請稍後再試';
                showMessage(msg, 'error');
                $btn.prop('disabled', false).text('立即註冊');
            }
        });
    });

    // --- 會員登入邏輯 ---
    $('#loginForm').on('submit', function(e) {
        e.preventDefault();
        const $btn = $(this).find('button');

        const payload = {
            email: $('#loginEmail').val(),
            password: $('#loginPass').val()
        };

        $btn.prop('disabled', true).text('登入中...');

        $.ajax({
            url: API_BASE + '/login',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(payload),
            success: function(res) {
                showMessage(res.username + ' 您好，歡迎回來！', 'success');
                localStorage.setItem('loginUser', res.username);
                // 登入成功後跳轉到首頁
                setTimeout(() => { 
                    window.location.href = 'index.html'; 
                }, 1000);
            },
            error: function(xhr) {
                const msg = xhr.responseJSON ? xhr.responseJSON.message : '帳號或密碼錯誤';
                showMessage(msg, 'error');
                $btn.prop('disabled', false).text('登入');
            }
        });
    });
});
