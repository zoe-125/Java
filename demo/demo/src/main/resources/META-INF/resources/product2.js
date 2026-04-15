$(document).ready(function() {
    
    // 1. 數量選擇器邏輯
    
    // 增加數量
    $('.plus').on('click', function() {
        let input = $(this).siblings('.qty-input');
        let val = parseInt(input.val());
        input.val(val + 1);
    });

    // 減少數量
    $('.minus').on('click', function() {
        let input = $(this).siblings('.qty-input');
        let val = parseInt(input.val());
        if (val > 1) { // 確保不小於 1
            input.val(val - 1);
        }
    });

    // 防止用戶在輸入框直接輸入小於1的數字
    $('.qty-input').on('blur', function() {
        if ($(this).val() < 1 || $(this).val() === '') {
            $(this).val(1);
        }
    });

    
    // 2. 縮圖切換大圖邏輯
    
    $('.thumb').on('click', function() {
        // a. 獲取被點擊縮圖的 src
        let newImgSrc = $(this).attr('src');
        
        // b. 更新主圖的 src
        // 注意：在真實電商中，主圖通常是更高解析度的圖片，這裡僅作模擬
        $('#mainImage').attr('src', newImgSrc);
        
        // c. 更新縮圖的 active 狀態
        $('.thumb').removeClass('active');
        $(this).addClass('active');
    });

    
    // 3. 按鈕點擊簡單反饋
    
    $('.btn-add-cart').on('click', function() {
        let qty = $('.qty-input').val();
        alert(`已成功將 ${qty} 台 TECO 23L 微波爐放入購物車！`);
    });

    $('.btn-direct-buy').on('click', function() {
        alert('正在前往結帳頁面...');
    });
    
});