package com.giatchan.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.web.bind.annotation.*;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    // 1. Lay danh sach toan bo don hang
    @GetMapping
    public ResponseEntity<?> getAllOrders() {
        List<Map<String, Object>> orders = jdbcTemplate.queryForList(
                "SELECT * FROM orders ORDER BY created_at DESC"
        );
        return ResponseEntity.ok(orders);
    }

    // 2. Tao don hang moi (Mac dinh trang thai NEED_PICKUP)
    @PostMapping
    public ResponseEntity<?> createOrder(@RequestBody Map<String, Object> body) {
        String orderCode = String.valueOf(body.get("order_code"));
        String customerName = String.valueOf(body.get("customer_name"));
        String customerPhone = body.get("customer_phone") != null ? String.valueOf(body.get("customer_phone")) : "";
        String address = body.get("address") != null ? String.valueOf(body.get("address")) : "";
        String items = String.valueOf(body.get("items"));
        int totalAmount = body.get("total_amount") != null ? Integer.parseInt(body.get("total_amount").toString()) : 0;

        String sql = "INSERT INTO orders (order_code, customer_name, customer_phone, address, items, total_amount, status) " +
                "VALUES (?, ?, ?, ?, ?, ?, 'NEED_PICKUP')";

        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, orderCode);
            ps.setString(2, customerName);
            ps.setString(3, customerPhone);
            ps.setString(4, address);
            ps.setString(5, items);
            ps.setInt(6, totalAmount);
            return ps;
        }, keyHolder);

        Number newId = keyHolder.getKey() != null ? keyHolder.getKey().longValue() : 0;
        return ResponseEntity.ok(Map.of(
                "message", "Lưu đơn hàng thành công!",
                "id", newId
        ));
    }

    // 3. Cap nhat trang thai don hang (Tra chan / Hoan thanh)
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable("id") Long orderId,
            @RequestBody Map<String, Object> body
    ) {
        String newStatus = String.valueOf(body.get("newStatus"));
        jdbcTemplate.update("UPDATE orders SET status = ? WHERE id = ?", newStatus, orderId);
        return ResponseEntity.ok(Map.of("message", "Đã cập nhật trạng thái!"));
    }
}