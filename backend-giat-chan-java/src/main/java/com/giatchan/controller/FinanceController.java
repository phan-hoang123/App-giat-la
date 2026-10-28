package com.giatchan.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class FinanceController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    // 1. Lay danh sach giao dich thu chi
    @GetMapping("/transactions")
    public ResponseEntity<?> getTransactions() {
        List<Map<String, Object>> transactions = jdbcTemplate.queryForList(
                "SELECT * FROM transactions ORDER BY created_at DESC"
        );
        return ResponseEntity.ok(transactions);
    }

    // 2. Ghi phieu thu / phieu chi moi
    @PostMapping("/transactions")
    public ResponseEntity<?> createTransaction(@RequestBody Map<String, Object> body) {
        String transCode = String.valueOf(body.get("trans_code"));
        String type = String.valueOf(body.get("type"));
        int amount = body.get("amount") != null ? Integer.parseInt(body.get("amount").toString()) : 0;
        String description = body.get("description") != null ? String.valueOf(body.get("description")) : "";

        jdbcTemplate.update(
                "INSERT INTO transactions (trans_code, type, amount, description) VALUES (?, ?, ?, ?)",
                transCode, type, amount, description
        );
        return ResponseEntity.ok(Map.of("message", "Ghi sổ quỹ thành công!"));
    }

    // 3. Lay bang gia giat chan
    @GetMapping("/prices")
    public ResponseEntity<?> getPrices() {
        List<Map<String, Object>> results = jdbcTemplate.queryForList("SELECT * FROM prices");
        if (results.isEmpty()) {
            return ResponseEntity.ok(List.of(
                    Map.of("id", 1, "name", "Chăn to (Khách lẻ)", "price", "35000"),
                    Map.of("id", 2, "name", "Chăn nhỏ (Khách lẻ)", "price", "25000")
            ));
        }
        return ResponseEntity.ok(results);
    }

    // 4. Cap nhat bang gia giat chan
    @PutMapping("/prices")
    @SuppressWarnings("unchecked")
    public ResponseEntity<?> updatePrices(@RequestBody Map<String, Object> body) {
        List<Map<String, Object>> prices = (List<Map<String, Object>>) body.get("prices");
        jdbcTemplate.execute("TRUNCATE TABLE prices");

        if (prices != null && !prices.isEmpty()) {
            for (Map<String, Object> p : prices) {
                jdbcTemplate.update(
                        "INSERT INTO prices (name, price) VALUES (?, ?)",
                        String.valueOf(p.get("name")),
                        String.valueOf(p.get("price"))
                );
            }
            return ResponseEntity.ok(Map.of("message", "Đã cập nhật bảng giá!"));
        }
        return ResponseEntity.ok(Map.of("message", "Bảng giá trống!"));
    }
}