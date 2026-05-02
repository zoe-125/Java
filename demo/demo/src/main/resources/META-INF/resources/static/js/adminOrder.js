$(document).ready(function() {
    fetchOrders();

    function fetchOrders() {
        $.ajax({
            url: '/api/orders/admin/all', 
            method: 'GET',
            success: function(orders) {
                const $tbody = $('#order-tbody');
                $tbody.empty();

                orders.forEach(order => {
                    // 根據狀態設定文字顏色標籤
                    const statusClass = order.status === '已完成' ? 'status-completed' : 'status-pending';
                    
                    const rowHtml = `
                        <tr>
                            <td>#${order.orderNumber}</td>
                            <td>${order.createdAt}</td>
                            <td>${order.receiverName}</td>
                            <td>${order.phone}</td>
                            <td><i class="fas fa-store"></i> ${order.shippingMethod}</td>
                            <td>NT$ ${order.totalAmount.toLocaleString()}</td>
                            <td><span class="status-badge ${statusClass}">${order.status}</span></td>
                            <td>
                                <select onchange="updateOrderStatus(${order.id}, this.value)">
                                    <option value="待處理" ${order.status === '待處理' ? 'selected' : ''}>待處理</option>
                                    <option value="已完成" ${order.status === '已完成' ? 'selected' : ''}>已完成</option>
                                    <option value="已取消" ${order.status === '已取消' ? 'selected' : ''}>已取消</option>
                                </select>
                            </td>
                        </tr>
                    `;
                    $tbody.append(rowHtml);
                });
            }
        });
    }
});

// 更新狀態的功能
window.updateOrderStatus = function(orderId, newStatus) {
    $.ajax({
        url: `/api/orders/${orderId}/status`,
        method: 'PATCH',
        contentType: 'application/json',
        data: JSON.stringify({ status: newStatus }),
        success: function() {
            Swal.fire('成功', '訂單狀態已更新', 'success');
        }
    });
};