$(document).ready(function() {
    // 初始載入
    fetchProducts();

    // --- 1. 抓取商品列表 (整合後台管理邏輯) ---
    function fetchProducts() {
        $.ajax({
            url: '/api/products',
            method: 'GET',
            success: function(products) {
                const $tbody = $('.product-table tbody');
                $tbody.empty(); 

                products.forEach(product => {
                    // --- 💡 邏輯：後端管理介面不跳過「已下架」，以便管理員重新上架 ---
                    
                    const imgTag = product.imageUrl ? 
                        `<img src="${product.imageUrl}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px; vertical-align: middle; margin-right: 8px;">` : '';
                    
                    const stockStyle = product.stock <= 5 ? 'color: red; font-weight: bold;' : '';
                    
                    const shortDesc = product.description && product.description.length > 20 
	                    ? product.description.substring(0, 20) + '...' 
	                    : (product.description || '無描述');

                    // --- 動態狀態與按鈕邏輯 ---
                    const isOffShelf = (product.status === '已下架');
                    const statusClass = isOffShelf ? 'status-off' : 'status-on';
                    const statusText = product.status || '上架中';
                    
                    // 動態切換按鈕文字與顏色
                    let actionButton = '';
                    if (isOffShelf) {
                        // 已下架狀態：顯示「上架」按鈕 (綠色)
                        actionButton = `<button class="btn-edit" style="background-color: #28a745;" onclick="updateProductStatus(${product.id}, '上架中', '${product.title}')">上架</button>`;
                    } else {
                        // 上架中狀態：顯示「下架」按鈕 (原本的樣式)
                        actionButton = `<button class="btn-down" onclick="updateProductStatus(${product.id}, '已下架', '${product.title}')">下架</button>`;
                    }

                    const rowHtml = `
                        <tr style="${isOffShelf ? 'background-color: #f8f9fa; color: #999;' : ''}">
                            <td>${product.id}</td>
                            <td style="text-align: left;">
                                ${imgTag}${product.title}
                            </td>
                            <td style="color: #666; font-size: 0.9em; max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${product.description || ''}">
                            	${shortDesc}
                        	</td>
                            <td>${product.category}</td>
                            <td>NT$ ${product.price.toLocaleString()}</td>
                            <td style="${stockStyle}">${product.stock || 0}</td>
                            <td><span class="${statusClass}">${statusText}</span></td>
                            <td class="actions">
                                <button class="btn-edit" onclick="editProduct(${product.id}, '${product.title}', ${product.price}, '${product.description || ''}', ${product.stock || 0})">編輯</button>
                                
                                ${actionButton} <!-- 這裡會自動切換上架/下架按鈕 -->
                                
                                <button class="btn-delete" onclick="deleteProduct(${product.id}, '${product.title}')">刪除</button>
                            </td>
                        </tr>
                    `;
                    $tbody.append(rowHtml);
                });
            },
            error: function(err) {
                console.error('抓取失敗:', err);
            }
        });
    }

    // --- 2. 統一的狀態更新功能 (整合原本的 offShelfProduct) ---
    window.updateProductStatus = function(id, newStatus, title) {
        const actionText = (newStatus === '已下架') ? '下架' : '上架';
        
        Swal.fire({
            title: `確定要${actionText}嗎？`,
            text: `商品「${title}」將變更為${newStatus}狀態。`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: '確定',
            cancelButtonText: '取消'
        }).then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    url: `/api/products/${id}/status`,
                    method: 'PATCH',
                    contentType: 'application/json',
                    data: JSON.stringify({ status: newStatus }),
                    success: function() {
                        Swal.fire('成功', `商品已${actionText}`, 'success');
                        fetchProducts(); 
                    },
                    error: function() {
                        Swal.fire('失敗', '無法更新狀態，請檢查後端接口。', 'error');
                    }
                });
            }
        });
    };

    // --- 3. 刪除功能 (保持原樣) ---
    window.deleteProduct = function(id, title) {
        Swal.fire({
            title: '確定要刪除嗎？',
            text: `商品「${title}」刪除後將無法復原！`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: '是的，刪除它！',
            cancelButtonText: '取消'
        }).then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    url: `/api/products/${id}`,
                    method: 'DELETE',
                    success: function() {
                        Swal.fire('已刪除！', '該商品已成功從清單中移除。', 'success');
                        fetchProducts(); 
                    },
                    error: function() {
                        Swal.fire('錯誤', '刪除失敗，請稍後再試。', 'error');
                    }
                });
            }
        });
    };

    // --- 4. 修改功能 (保持原樣) ---
    window.editProduct = function(id, title, currentPrice, currentDesc, currentStock) {
        Swal.fire({
            title: `修改商品：${title}`,
            html: `
                <div class="swal-form-container" style="text-align: left; padding: 0 10px;">
                <div style="margin-bottom: 15px;">
                    <label for="swal-price" style="font-weight: bold; display: block; margin-bottom: 5px;">價格 (TWD)：</label>
                    <input id="swal-price" type="number" min="0" class="swal2-input" 
                        style="width: 100%; height: 45px; margin: 0; box-sizing: border-box;" 
                        value="${currentPrice}">
                </div>
                <div style="margin-bottom: 15px;">
                    <label for="swal-stock" style="font-weight: bold; display: block; margin-bottom: 5px;">庫存數量：</label>
                    <input id="swal-stock" type="number" min="0" class="swal2-input" 
                        style="width: 100%; height: 45px; margin: 0; box-sizing: border-box;" 
                        value="${currentStock}">
                </div>
                <div style="margin-bottom: 15px;">
                    <label for="swal-desc" style="font-weight: bold; display: block; margin-bottom: 5px;">商品描述：</label>
                    <textarea id="swal-desc" class="swal2-textarea" 
                        style="width: 100%; height: 120px; margin: 0; box-sizing: border-box; padding: 10px;" 
                        placeholder="請輸入商品詳細描述">${currentDesc}</textarea>
                </div>
            </div>
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: '儲存修改',
            cancelButtonText: '取消',
            didOpen: () => {
                $('#swal-price, #swal-stock').on('keydown', function(e) {
                    if (e.key === '-' || e.key === 'e') {
                        e.preventDefault();
                    }
                });
            },
            preConfirm: () => {
                const newPrice = parseFloat($('#swal-price').val());
                const newStock = parseInt($('#swal-stock').val());
                const newDesc = $('#swal-desc').val();
                
                if (isNaN(newPrice) || newPrice < 0) {
                    Swal.showValidationMessage(`價格必須是大於或等於 0 的數字`);
                    return false;
                }
                if (isNaN(newStock) || newStock < 0) {
                    Swal.showValidationMessage(`庫存不能為負數`);
                    return false;
                }
                
                return { 
                    price: newPrice, 
                    stock: newStock, 
                    description: newDesc 
                };
            }
        }).then((result) => {
            if (result.isConfirmed) {
                updateProductRequest(id, result.value);
            }
        });
    };

    // --- 5. 發送修改請求 (保持原樣) ---
    function updateProductRequest(id, data) {
        $.ajax({
            url: `/api/products/${id}`,
            method: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify(data),
            success: function() {
                Swal.fire({
                    icon: 'success',
                    title: '更新成功！',
                    showConfirmButton: false,
                    timer: 1500
                });
                fetchProducts(); 
            },
            error: function() {
                Swal.fire('錯誤', '更新失敗，請確認後端 PUT 接口與資料格式。', 'error');
            }
        });
    }

    // --- 6. 新增商品功能 (保持原樣) ---
    window.addProduct = function() {
        $.get('/api/products/categories', function(categories) {
            const optionsHtml = categories.map(cat => `<option value="${cat}">`).join('');

            Swal.fire({
                title: '新增商品',
                html: `
                    <div class="swal-form-container" style="text-align: left;">
                        <div style="margin-bottom: 10px;">
                            <label style="display:block; font-weight:bold;">商品名稱</label>
                            <input type="text" id="title" class="swal2-input" style="width:100%; margin: 5px 0;" placeholder="請輸入商品完整標題">
                        </div>
                        <div style="margin-bottom: 10px;">
                            <label style="display:block; font-weight:bold;">商品分類</label>
                            <input type="text" id="category" class="swal2-input" style="width:100%; margin: 5px 0;" 
                                   placeholder="請輸入或選擇分類" list="category-list" autocomplete="off">
                            <datalist id="category-list">
                                ${optionsHtml}
                            </datalist>
                        </div>
                        <div style="margin-bottom: 10px; display: flex; gap: 10px;">
                            <div style="flex: 1;">
                                <label style="display:block; font-weight:bold;">價格 (TWD)</label>
                                <input type="number" id="price" class="swal2-input" style="width:100%; margin: 5px 0;" placeholder="金額" min="0">
                            </div>
                            <div style="flex: 1;">
                                <label style="display:block; font-weight:bold;">庫存數量</label>
                                <input type="number" id="stock" class="swal2-input" style="width:100%; margin: 5px 0;" value="0" min="0">
                            </div>
                        </div>
                        <div style="margin-bottom: 10px;">
                            <label style="display:block; font-weight:bold;">商品描述</label>
                            <textarea id="description" class="swal2-textarea" style="width:100%; margin: 5px 0; height: 80px;" placeholder="描述特色..."></textarea>
                        </div>
                        <div style="margin-bottom: 10px;">
                            <label style="display:block; font-weight:bold;">商品圖片</label>
                            <input type="file" id="imageFile" accept="image/jpeg, image/png, image/jpg" style="margin-top: 5px;">
                            <div id="imagePreview" style="margin-top: 10px; display: none; text-align: center;">
                                <img src="" style="max-width: 100%; height: 100px; border-radius: 8px; border: 1px solid #ddd; object-fit: cover;">
                            </div>
                        </div>
                    </div>
                `,
                showCancelButton: true,
                confirmButtonText: '確認上架',
                cancelButtonText: '取消',
                focusConfirm: false,
                didOpen: () => {
                    $('#price, #stock').on('keydown', function(e) {
                        if (e.key === '-' || e.key === 'e') {
                            e.preventDefault();
                        }
                    });

                    $('#imageFile').on('change', function() {
                        const file = this.files[0];
                        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
                        if (file) {
                            if (!allowedTypes.includes(file.type)) {
                                Swal.showValidationMessage("❌ 請上傳 JPG 或 PNG 圖片");
                                $(this).val('');
                                return;
                            }
                            const reader = new FileReader();
                            reader.onload = (e) => {
                                $('#imagePreview img').attr('src', e.target.result);
                                $('#imagePreview').fadeIn();
                            };
                            reader.readAsDataURL(file);
                        }
                    });
                },
                preConfirm: () => {
                    const title = $('#title').val().trim();
                    const category = $('#category').val().trim();
                    const priceRaw = parseFloat($('#price').val());
                    const stockRaw = parseInt($('#stock').val());
                    const description = $('#description').val().trim();
                    const fileInput = $('#imageFile')[0];

                    if (!title || !category || isNaN(priceRaw) || isNaN(stockRaw) || !description) {
                        Swal.showValidationMessage("⚠️ 所有的欄位都必須填寫喔！");
                        return false;
                    }
                    if (priceRaw < 0) {
                        Swal.showValidationMessage("⚠️ 價格不能為負數");
                        return false;
                    }
                    if (stockRaw < 0) {
                        Swal.showValidationMessage("⚠️ 庫存不能為負數");
                        return false;
                    }
                    if (fileInput.files.length === 0) {
                        Swal.showValidationMessage("⚠️ 請選擇商品圖片");
                        return false;
                    }

                    return {
                        title, category, 
                        price: priceRaw, 
                        stock: stockRaw, 
                        description,
                        image: fileInput.files[0]
                    };
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    submitNewProduct(result.value);
                }
            });
        }).fail(function() {
            console.error("無法載入分類選項");
        });
    };

    // --- 7. 發送新增請求 (保持原樣) ---
    function submitNewProduct(data) {
        const formData = new FormData();
        formData.append('title', data.title);
        formData.append('category', data.category);
        formData.append('price', data.price);
        formData.append('stock', data.stock);
        formData.append('description', data.description);
        formData.append('image', data.image);

        Swal.fire({ title: '處理中...', didOpen: () => Swal.showLoading(), allowOutsideClick: false });

        $.ajax({
            url: '/api/products/upload-with-image',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            success: function(response) {
                Swal.fire('✅ 上架成功！', `商品 ID: ${response.id}`, 'success');
                fetchProducts(); 
            },
            error: function(xhr) {
                Swal.fire('❌ 失敗', xhr.responseText || "上架失敗", 'error');
            }
        });
    }
});

