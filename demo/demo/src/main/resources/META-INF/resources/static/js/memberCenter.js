$(document).ready(function() {
    const loginUser = JSON.parse(localStorage.getItem('loginUser'));
    if (!loginUser) {
        window.location.href = "login.html";
        return;
    }

    // 1. 初始化資料：修正對應 HTML 的 ID
    $('#member-email').val(loginUser.email || "未提供");
    $('#member-username').val(loginUser.username || "");
    $('#member-phone').val(loginUser.phone || ""); 
    $('#member-address').val(loginUser.address || "");

    // 🚩 新增：處理會員等級顯示 (對應 localStorage 的 role 欄位)
    const roleText = (loginUser.role === 'ADMIN') ? '管理員' : '一般會員';
    $('#member-role').val(roleText); 

    // 2. 登出功能
    $('#logoutBtn').click(function() {
        if(confirm("確定要登出嗎？")) {
            localStorage.removeItem('loginUser'); // 建議只移除 user，保留其他設定
            window.location.href = "login.html";
        }
    });

    // 3. 修改資料提交
    $('#memberUpdateForm').submit(function(e) {
        e.preventDefault();
        const updateData = {
            id: loginUser.id,
            username: $('#member-username').val(),
            phone: $('#member-phone').val(),
            address: $('#member-address').val()
        };

        $.ajax({
            url: '/api/members/update', 
            type: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify(updateData),
            success: function(response) {
                alert("資料更新成功！");
                // 🚩 更新成功後，把後端回傳的完整新資料存回 localStorage
                localStorage.setItem('loginUser', JSON.stringify(response));
                location.reload(); 
            },
            error: function(xhr) {
                alert("更新失敗：" + xhr.responseText);
            }
        });
    });
});