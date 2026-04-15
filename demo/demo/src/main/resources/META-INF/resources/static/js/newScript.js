$(document).ready(function() {
    
    /**
     * 1. 圖片預覽與檔案格式檢查
     */
    $('#imageFile').on('change', function() {
        const file = this.files[0];
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];

        if (file) {
            // 檢查檔案格式是否正確
            if (!allowedTypes.includes(file.type)) {
                showStatus("❌ 格式不符！請上傳 JPG 或 PNG 圖片。", "error");
                $(this).val(''); // 重置檔案選擇器
                $('#imagePreview').hide();
                return;
            }

            // 讀取檔案並顯示預覽
            const reader = new FileReader();
            reader.onload = function(e) {
                // 確保你的 HTML 裡有 #imagePreview img 標籤
                $('#imagePreview img').attr('src', e.target.result);
                $('#imagePreview').fadeIn();
            }
            reader.readAsDataURL(file);
        }
    });

    /**
     * 2. 提交按鈕點擊事件（含完整驗證）
     */
    $('#submitBtn').on('click', function() {
        // 抓取並清理輸入值
        const title = $('#title').val().trim();
        const category = $('#category').val().trim();
        const priceRaw = $('#price').val();
        const price = parseInt(priceRaw);
        
        // ✅ 新增：抓取庫存
        const stockRaw = $('#stock').val();
        const stock = parseInt(stockRaw);
        
        const description = $('#description').val().trim();
        const fileInput = $('#imageFile')[0];

        // --- 欄位檢查 (Validation) ---
        
        // 檢查是否為空
        if (!title || !category || !priceRaw || !stockRaw || !description) {
            showStatus("⚠️ 所有的欄位都必須填寫喔！", "error");
            return;
        }

        // 檢查價格是否合法
        if (isNaN(price) || price <= 0) {
            showStatus("⚠️ 商品價格必須是大於 0 的數字！", "error");
            return;
        }
        
        // ✅ 增加庫存檢查（不能小於 0）
        if (isNaN(stock) || stock < 0) {
            showStatus("⚠️ 庫存數量不能小於 0！", "error");
            return;
        }

        // 檢查是否有選圖片
        if (fileInput.files.length === 0) {
            showStatus("⚠️ 請先選擇一張商品圖片！", "error");
            return;
        }

        // --- 封裝資料 (FormData) ---
        const formData = new FormData();
        formData.append('title', title);
        formData.append('category', category);
        formData.append('price', price);
        formData.append('description', description);
        
        // ✅ 新增：對應後端參數名 (雖然目前後端 upload-with-image 尚未在參數列定義 stock，但建議加上)
        formData.append('stock', stock);
        
        // 重要修改：將原本的 'file' 改為 'image'，以對應後端的 @RequestParam("image")
        formData.append('image', fileInput.files[0]);

        // 停用按鈕防止重複點擊
        const $btn = $(this);
        $btn.prop('disabled', true).text('處理中...');

        // --- 送出 AJAX ---
        $.ajax({
            url: '/api/products/upload-with-image',
            type: 'POST',
            data: formData,
            processData: false, // 必須：告訴 jQuery 不要處理資料
            contentType: false, // 必須：告訴 jQuery 不要設置內容類型
            success: function(response) {
            
                // 1. 顯示成功訊息,回傳的 response 是你後端 return 的 Product 物件
                showStatus(`✅ 上架成功！商品 ID: ${response.id}`, "success");
                
                // 2. 延遲 1.5 秒後跳轉 (給使用者一點時間看到成功訊息)
        		setTimeout(() => {
            		window.location.href = "adminProduct.html";
        		}, 1000);
                
                //clearForm();
            },
            error: function(xhr) {
            
                // 嘗試從後端抓取具體的錯誤訊息
                let errorMsg = "上架失敗，請確認檔案大小或連線狀態。";
                if (xhr.responseText) {
                    errorMsg = "❌ 失敗：" + xhr.responseText;
                }
                showStatus(errorMsg, "error");
                console.error("Upload error details:", xhr.responseText);
            },
            complete: function() {
                // 無論成功或失敗都恢復按鈕
                $btn.prop('disabled', false).text('確認上架');
            }
        });
    });
	
	// --- 🚩 新增：返回按鈕事件處理 ---
    $('#backBtn').click(function() {
        window.location.href = "AdminProduct.html";
    });
	
    /**
     * 工具函式：顯示狀態訊息
     */
    function showStatus(text, type) {
        // 確保 HTML 有 id="message" 的標籤
        $('#message').hide().text(text)
            .removeClass('message-success message-error')
            .addClass(type === 'success' ? 'message-success' : 'message-error')
            .fadeIn();
    }

    /**
     * 工具函式：清空表單
     */
    function clearForm() {
        $('input, textarea').val('');
        $('#imageFile').val('');
        $('#imagePreview').hide();
    }
});