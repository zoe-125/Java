$(function(){

    let count = 0;

    $(document).on("click", ".btn", function(){
        count++;
        alert("已加入購物車！目前數量：" + count);
    });

});


<!--原始product.js-->
$(document).ready(function() {
    // 模擬從後端 API 取得的 JSON 資料
    const productData = {
        id: "14693841",
        brand: "TECO 東元",
        title: "白大廚 23L 三合一多功能氣炸烤微波爐",
        model: "YM2302CBW",
        capacity: "23L",
        promoText: "氣炸+燒烤+微波，一機搞定",
        marketPrice: 7990,
        currentPrice: 6990,
        features: [
            "23L 大容量，烤全雞也 OK",
            "10 道自動料理 + 9 道氣炸菜單",
            "附烤盤、高/矮烤架，方便烤製"
        ],
        images: [
            "https://image.momoshop.com.tw/goodsimg/0014/693/841/14693841_L.webp",
            "https://image.momoshop.com.tw/goodsimg/0014/693/841/14693841_S.webp"
        ],
        warranty: "1 年保固期"
    };

    // 呼叫渲染函數
    renderProduct(productData);

    function renderProduct(data) {
        // 1. 填充基本文字資訊
        $('#productTitle').html(`<span class="brand">${data.brand}</span> ${data.title} (${data.model})`);
        $('#productCapacity').text(data.capacity);
        $('#productModel').text(data.model);
        $('#marketPrice').text(`$ ${data.marketPrice.toLocaleString()}`);
        $('#priceValue').text(data.currentPrice.toLocaleString());
        $('#brandName').html(`${data.brand} <i class="far fa-heart heart-icon"></i>`);
        $('#promoTags').append(`<span class="tag tag-pink">${data.promoText}</span>`);

        // 2. 填充產品特點 (Array)
        let featureHtml = '';
        data.features.forEach(item => {
            featureHtml += `<li>${item}</li>`;
        });
        $('#featureList').html(featureHtml);

        // 3. 填充圖片與縮圖
        $('#mainImage').attr('src', data.images[0]);
        let thumbHtml = '';
        data.images.forEach((img, index) => {
            const activeClass = index === 0 ? 'active' : '';
            thumbHtml += `<img src="${img}" class="thumb ${activeClass}" alt="縮圖">`;
        });
        $('#thumbList').html(thumbHtml);
    }

    // --- 互動事件 (保持不變) ---
    
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
    	
    
    $(document).on('click', '.thumb', function() {
        $('#mainImage').attr('src', $(this).attr('src'));
        $('.thumb').removeClass('active');
        $(this).addClass('active');
    });

    // 數量增減
    $('.plus').click(function() {
        let input = $('.qty-input');
        input.val(parseInt(input.val()) + 1);
    });

    $('.minus').click(function() {
        let input = $('.qty-input');
        if (parseInt(input.val()) > 1) input.val(parseInt(input.val()) - 1);
    });
});



<!--目前最新且正常的(如果有壞可以使用此js)-->
$(document).ready(function() {
    // 1. 商品資料定義
    const productData = {
        id: "14693841",
        brand: "TECO 東元",
        title: "白大廚 23L 三合一多功能氣炸烤微波爐",
        model: "YM2302CBW",
        capacity: "23L",
        promoText: "氣炸+燒烤+微波，一機搞定",
        marketPrice: 7990,
        currentPrice: 6990,
        features: [
            "23L 大容量，烤全雞也 OK",
            "10 道自動料理 + 9 道氣炸菜單",
            "附烤盤、高/矮烤架，方便烤製"
        ],
        images: [
            "https://image.momoshop.com.tw/goodsimg/0014/693/841/14693841_L.webp",
            "https://image.momoshop.com.tw/goodsimg/0014/693/841/14693841_S.webp"
        ],
        warranty: "1 年保固期"
    };

    // 2. 初始化渲染
    renderProduct(productData);
    updateCartCount();

    // --- 核心邏輯函數：處理 LocalStorage 儲存 ---
    function saveToCart(qty) {
        let cart = JSON.parse(localStorage.getItem('myCart')) || [];
        const existingItem = cart.find(item => item.id === productData.id);

        if (existingItem) {
            existingItem.qty += qty;
        } else {
            cart.push({
                id: productData.id,
                name: productData.brand + " " + productData.title,
                price: productData.currentPrice,
                img: productData.images[1], // 使用縮圖
                qty: qty
            });
        }
        localStorage.setItem('myCart', JSON.stringify(cart));
    }

    // 3. 數量選擇器
    $('.plus').click(function() {
        let val = parseInt($('.qty-input').val());
        $('.qty-input').val(val + 1);
    });

    $('.minus').click(function() {
        let val = parseInt($('.qty-input').val());
        if (val > 1) $('.qty-input').val(val - 1);
    });

    // 4. 加入購物車 (點擊後停留原頁面)
    $('.btn-add-cart').click(function() {
        const qty = parseInt($('.qty-input').val());
        saveToCart(qty); // 呼叫共用邏輯
        updateCartCount();

        // 按鈕視覺回饋
        const $btn = $(this);
        const originalHtml = $btn.html();
        $btn.html('<i class="fas fa-check"></i> 已加入！').css('background', '#28a745');
        setTimeout(() => {
            $btn.html(originalHtml).css('background', '#4ec3e0');
        }, 1000);
    });

    // 5. 直接購買 (點擊後存檔並跳轉)
    $('.btn-direct-buy').click(function() {
        const qty = parseInt($('.qty-input').val());
        saveToCart(qty); // 呼叫共用邏輯
        window.location.href = 'cart.html'; // 跳轉至購物車頁面
    });

    // 6. 點擊購物車圖示跳轉
    $('.cart-status').click(function() {
        window.location.href = 'cart.html';
    });

    // 7. 縮圖切換
    $(document).on('click', '.thumb', function() {
        $('#mainImage').attr('src', $(this).attr('src'));
        $('.thumb').removeClass('active');
        $(this).addClass('active');
    });

    // --- 輔助函數 ---
    function renderProduct(data) {
        $('#render-title').html(`<span style="color:#003399">${data.brand}</span> ${data.title} (${data.model})`);
        $('#render-capacity').text(data.capacity);
        $('#render-market-price').text(`$ ${data.marketPrice.toLocaleString()}`);
        $('#render-current-price').text(data.currentPrice.toLocaleString());
        $('#render-brand').text(data.brand);
        $('#render-warranty').text(data.warranty);
        $('#render-promo-tags').html(`<span class="tag-pink">${data.promoText}</span>`);

        let featureHtml = '';
        data.features.forEach(f => featureHtml += `<li>${f}</li>`);
        $('#render-features').html(featureHtml);

        $('#mainImage').attr('src', data.images[0]);
        let thumbHtml = '';
        data.images.forEach((img, i) => {
            thumbHtml += `<img src="${img}" class="thumb ${i === 0 ? 'active' : ''}" alt="縮圖">`;
        });
        $('#render-thumbnails').html(thumbHtml);
    }

    function updateCartCount() {
        let cart = JSON.parse(localStorage.getItem('myCart')) || [];
        let total = cart.reduce((sum, item) => sum + item.qty, 0);
        $('#cart-count').text(total);
    }
    
    <!--加入這段 -->
    const PRODUCT_UD = new URLSearchParams(location.search).get("id") || productData.id;
    const API_URL = "/api/products/$(encodeURIComponent(PRODUCT_ID))";
  	
  	function loadProduct() {
  		
  		return $.ajax({
  		url: API_URL,
  		method: "GET",
  		dataType: "json",		
  		}).fail(function(jqXHR,rextStatus,errorThrown){
  		console.error("loadProduct failed:",textStatus,errorThrown);
  		console.error("resoponse:",jqXHR.responseText);
  		});
	} 
      
});


<!--最最新product.js -->
$(document).ready(function() {
    // --- 1. 取得 URL ID 並進行攔截 ---
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get("id");

    // 如果網址沒有 id，隱藏主容器並顯示提示
    if (!productId) {
        $('.main-container').hide(); 
        $('body').append('<div style="text-align:center; padding:100px;"><h2>請從商品列表選購商品</h2><a href="index.html" style="color:#4ec3e0;">回首頁</a></div>');
        return; // 🚩 停止執行後續所有程式碼
    }

    // --- 2. 初始化變數 ---
    window.currentProduct = null;

    // --- 3. 啟動流程 ---
    loadProduct(productId);

    // --- 4. API 抓取函數 ---
    function loadProduct(id) {
        const API_URL = `/api/products/${encodeURIComponent(id)}`;
        
        $.ajax({
            url: API_URL,
            method: "GET",
            dataType: "json",
            success: function(data) {
                window.currentProduct = data;
                renderProduct(data);
                updateCartCount(); // 初始同步購物車數量
            },
            error: function() {
                $('.main-container').html('<h2 style="text-align:center; padding:100px;">找不到該商品</h2>');
            }
        });
    }

    // --- 5. 核心邏輯：儲存到 LocalStorage ---
    function saveToCart(qty) {
        if (!window.currentProduct) return;
        
        let cart = JSON.parse(localStorage.getItem('myCart')) || [];
        const existingItem = cart.find(item => item.id === window.currentProduct.id);

        if (existingItem) {
            existingItem.qty += qty;
        } else {
            cart.push({
                id: window.currentProduct.id,
                name: window.currentProduct.brand + " " + window.currentProduct.title,
                price: window.currentProduct.currentPrice,
                img: window.currentProduct.images[0],
                qty: qty
            });
        }
        localStorage.setItem('myCart', JSON.stringify(cart));
    }

    // --- 6. 事件處理 ---

    // 數量增減
    $('.plus').click(function() {
        let val = parseInt($('.qty-input').val());
        $('.qty-input').val(val + 1);
    });

    $('.minus').click(function() {
        let val = parseInt($('.qty-input').val());
        if (val > 1) $('.qty-input').val(val - 1);
    });

    // 「加入購物車」按鈕：顯示已加入但不跳轉
    $('.btn-add-cart').click(function() {
        const qty = parseInt($('.qty-input').val());
        saveToCart(qty); 
        updateCartCount(); 

        const $btn = $(this);
        const originalHtml = $btn.html();
        
        // 視覺變色回饋
        $btn.html('<i class="fas fa-check"></i> 已加入！')
            .css('background-color', '#28a745')
            .prop('disabled', true);

        setTimeout(() => {
            $btn.html(originalHtml)
                .css('background-color', '') // 移除 inline style 恢復 CSS 定義的顏色
                .prop('disabled', false);
        }, 1500);
    });

    // 「直接購買」按鈕：存檔並直接跳轉
    $('.btn-direct-buy').click(function() {
        const qty = parseInt($('.qty-input').val());
        saveToCart(qty);
        window.location.href = 'cart.html';
    });

    // 「頂部購物車狀態列」：點擊後跳轉
    $('.cart-status').click(function() {
        window.location.href = 'cart.html';
    });

    // --- 7. 渲染與輔助函數 ---

    function renderProduct(data) {
        $('#render-title').html(`<span style="color:#003399">${data.brand}</span> ${data.title} (${data.model})`);
        $('#render-capacity').text(data.capacity);
        $('#render-market-price').text(`$ ${data.marketPrice.toLocaleString()}`);
        $('#render-current-price').text(data.currentPrice.toLocaleString());
        $('#render-brand').text(data.brand);
        $('#render-warranty').text(data.warranty);
        $('#render-promo-tags').html(`<span class="tag-pink">${data.promoText}</span>`);

        let featureHtml = '';
        data.features.forEach(f => featureHtml += `<li>${f}</li>`);
        $('#render-features').html(featureHtml);

        $('#mainImage').attr('src', data.images[0]);
        let thumbHtml = '';
        data.images.forEach((img, i) => {
            thumbHtml += `<img src="${img}" class="thumb ${i === 0 ? 'active' : ''}" alt="縮圖">`;
        });
        $('#render-thumbnails').html(thumbHtml);
    }

    function updateCartCount() {
        let cart = JSON.parse(localStorage.getItem('myCart')) || [];
        let total = cart.reduce((sum, item) => sum + item.qty, 0);
        $('#cart-count').text(total); 
    }

    // 縮圖切換監聽
    $(document).on('click', '.thumb', function() {
        $('#mainImage').attr('src', $(this).attr('src'));
        $('.thumb').removeClass('active');
        $(this).addClass('active');
    });
});