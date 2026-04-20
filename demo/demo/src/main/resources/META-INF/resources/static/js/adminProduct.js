$(document).ready(function() {
    // 初始載入
    fetchProducts();

    // 1. 抓取商品列表
    function fetchProducts() {
        $.ajax({
            url: '/api/products',
            method: 'GET',
            success: function(products) {
                const $list = $('#productList');
                $list.empty(); // 清空舊內容

                products.forEach(product => {
                    const imgUrl = product.imageUrl ? product.imageUrl : 'https://via.placeholder.com/130';
                    
                    const cardHtml = `
                        <div class="product-card" id="card-${product.id}">
                            <img src="${imgUrl}" alt="商品圖片" class="product-img">
                            <div class="product-info">
                                <h3 class="product-title">${product.title}</h3>
                                <p class="product-description" style="color: #666; font-size: 0.9rem; margin: 5px 0;">${product.description || '暫無描述'}</p>
                                <p class="product-price">單價：$${product.price.toLocaleString()}</p>
                                
                                <p class="product-stock" style="font-size: 0.9rem; color: ${product.stock <= 5 ? 'red' : '#666'}; font-weight: ${product.stock <= 5 ? 'bold' : 'normal'};">
                                    庫存：${product.stock || 0}
                                </p>

                                <div class="bottom-row">
                                    <span class="category-tag">${product.category}</span>
                                    <span class="total-price">$${product.price.toLocaleString()}</span>
                                </div>
                            </div>
                            
                            <button class="edit-btn" onclick="editProduct(${product.id}, '${product.title}', ${product.price}, '${product.description || ''}', ${product.stock || 0})">
                                ✏️
                            </button>

                            <button class="delete-btn" onclick="deleteProduct(${product.id}, '${product.title}')">
                                🗑️
                            </button>
                        </div>
                    `;
                    $list.append(cardHtml);
                });
            },
            error: function(err) {
                console.error('抓取失敗:', err);
            }
        });
    }

    // 2. 刪除功能
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

    // 🚩 3. 修改功能：調整 HTML 結構以符合 CSS 對齊
    window.editProduct = function(id, title, currentPrice, currentDesc, currentStock) {
        Swal.fire({
            title: `修改商品：${title}`,
            // 🚩 修改重點：使用 swal-form-container 結構
            html: `
                <div class="swal-form-container">
                    <label for="swal-price">價格：</label>
                    <input id="swal-price" type="number" value="${currentPrice}" placeholder="請輸入價格">
                    
                    <label for="swal-stock">庫存：</label>
                    <input id="swal-stock" type="number" value="${currentStock}" placeholder="請輸入庫存數量">
                    
                    <label for="swal-desc">描述：</label>
                    <textarea id="swal-desc" placeholder="請輸入商品描述">${currentDesc}</textarea>
                </div>
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: '儲存修改',
            cancelButtonText: '取消',
            preConfirm: () => {
                const newPrice = $('#swal-price').val();
                const newStock = $('#swal-stock').val();
                const newDesc = $('#swal-desc').val();
                
                if (!newPrice || newPrice <= 0) {
                    Swal.showValidationMessage(`價格必須大於 0`);
                    return false;
                }
                if (newStock < 0) {
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

    // 4. 發送修改請求
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
});