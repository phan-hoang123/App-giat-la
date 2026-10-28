package com.giatchan.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class SystemStaffController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder(10);

    // 1. Lay danh sach nhan su va quyen tu bang users
    @GetMapping("/staff")
    public ResponseEntity<?> getStaffList() {
        String sql = "SELECT id, phone, name, UPPER(IFNULL(role, 'STAFF')) AS role, created_at FROM users ORDER BY id ASC";
        List<Map<String, Object>> users = jdbcTemplate.queryForList(sql);

        List<Map<String, Object>> formatted = new ArrayList<>();
        for (Map<String, Object> u : users) {
            Map<String, Object> item = new HashMap<>();
            item.put("id", u.get("id"));
            item.put("name", u.get("name"));
            item.put("phone", u.get("phone"));
            item.put("role", u.get("role"));
            item.put("active", 1);
            formatted.add(item);
        }
        return ResponseEntity.ok(formatted);
    }

    // 2. Them nhan vien moi & cap quyen App/Web
    @PostMapping("/staff")
    public ResponseEntity<?> createOrUpdateStaff(@RequestBody Map<String, Object> body) {
        String name = (String) body.get("name");
        String phone = (String) body.get("phone");
        String password = (String) body.get("password");
        String role = body.get("role") != null ? body.get("role").toString().toUpperCase() : "STAFF";

        if (name == null || phone == null || password == null) {
            return ResponseEntity.status(400).body(Map.of("error", "Vui lòng nhập đủ tên, SĐT và mật khẩu!"));
        }

        String hashedPassword = passwordEncoder.encode(password);
        List<Map<String, Object>> existing = jdbcTemplate.queryForList(
                "SELECT * FROM users WHERE phone = ?", phone
        );

        if (!existing.isEmpty()) {
            jdbcTemplate.update(
                    "UPDATE users SET name = ?, password = ?, role = ? WHERE phone = ?",
                    name, hashedPassword, role, phone
            );
            return ResponseEntity.ok(Map.of("message", "Đã cập nhật thông tin & quyền nhân sự!"));
        } else {
            jdbcTemplate.update(
                    "INSERT INTO users (phone, name, password, role) VALUES (?, ?, ?, ?)",
                    phone, name, hashedPassword, role
            );
            return ResponseEntity.ok(Map.of("message", "Đã thêm nhân viên thành công!"));
        }
    }

    // 3. Doi quyen nhanh ADMIN <-> STAFF
    @PutMapping("/staff/{id}/toggle")
    public ResponseEntity<?> toggleStaffRole(@PathVariable("id") Long userId) {
        String sql = "UPDATE users SET role = CASE WHEN UPPER(IFNULL(role, 'STAFF')) = 'ADMIN' THEN 'STAFF' ELSE 'ADMIN' END WHERE id = ?";
        jdbcTemplate.update(sql, userId);
        return ResponseEntity.ok(Map.of("message", "Đã chuyển đổi quyền ADMIN / STAFF!"));
    }

    // 4. Cac API Ton kho vat tu (/api/inventory)
    @GetMapping("/inventory")
    public ResponseEntity<?> getInventory() {
        return ResponseEntity.ok(jdbcTemplate.queryForList("SELECT * FROM inventory"));
    }

    @PutMapping("/inventory/{id}/restock")
    public ResponseEntity<?> restockInventory(@PathVariable("id") Long id, @RequestBody Map<String, Object> body) {
        int added = Integer.parseInt(body.get("added_amount").toString());
        jdbcTemplate.update("UPDATE inventory SET stock = stock + ? WHERE id = ?", added, id);
        return ResponseEntity.ok(Map.of("message", "Đã nhập kho thành công!"));
    }

    @PutMapping("/inventory/{id}/consume")
    public ResponseEntity<?> consumeInventory(@PathVariable("id") Long id) {
        jdbcTemplate.update("UPDATE inventory SET stock = GREATEST(stock - 1, 0) WHERE id = ?", id);
        return ResponseEntity.ok(Map.of("message", "Đã trừ kho thành công!"));
    }
}