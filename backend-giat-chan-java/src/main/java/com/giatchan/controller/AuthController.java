package com.giatchan.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder(10);

    // 1. API DANG NHAP (/api/login)
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, Object> body) {
        String phone = (String) body.get("phone");
        String password = (String) body.get("password");

        List<Map<String, Object>> users = jdbcTemplate.queryForList(
                "SELECT * FROM users WHERE phone = ?", phone
        );

        if (users.isEmpty()) {
            return ResponseEntity.status(400).body(Map.of("error", "Sai Số điện thoại hoặc Mật khẩu!"));
        }

        Map<String, Object> user = users.get(0);
        String storedHash = (String) user.get("password");

        if (!passwordEncoder.matches(password, storedHash)) {
            return ResponseEntity.status(400).body(Map.of("error", "Sai Số điện thoại hoặc Mật khẩu!"));
        }

        String role = user.get("role") != null
                ? user.get("role").toString().toUpperCase()
                : "STAFF";

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Đăng nhập thành công");
        response.put("id", user.get("id"));
        response.put("name", user.get("name"));
        response.put("phone", user.get("phone"));
        response.put("role", role);

        return ResponseEntity.ok(response);
    }

    // 2. API DANG KY TAI KHOAN (/api/register)
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, Object> body) {
        String phone = (String) body.get("phone");
        String name = (String) body.get("name");
        String password = (String) body.get("password");
        String role = body.get("role") != null ? body.get("role").toString().toUpperCase() : "STAFF";

        List<Map<String, Object>> existing = jdbcTemplate.queryForList(
                "SELECT * FROM users WHERE phone = ?", phone
        );
        if (!existing.isEmpty()) {
            return ResponseEntity.status(400).body(Map.of("error", "Số điện thoại này đã được đăng ký!"));
        }

        String hashedPassword = passwordEncoder.encode(password);
        jdbcTemplate.update(
                "INSERT INTO users (phone, name, password, role) VALUES (?, ?, ?, ?)",
                phone, name, hashedPassword, role
        );

        return ResponseEntity.ok(Map.of(
                "message", "Đăng ký thành công!",
                "name", name,
                "phone", phone,
                "role", role
        ));
    }

    // 3. API LAY SO DIA CHI KHACH HANG (/api/addresses)
    @GetMapping("/addresses")
    public ResponseEntity<?> getAddresses(@RequestParam("phone") String phone) {
        List<Map<String, Object>> results = jdbcTemplate.queryForList(
                "SELECT id, address_text AS text FROM saved_addresses WHERE phone = ?", phone
        );
        return ResponseEntity.ok(results);
    }

    // 4. API THEM DIA CHI MOI (/api/addresses)
    @PostMapping("/addresses")
    public ResponseEntity<?> addAddress(@RequestBody Map<String, Object> body) {
        String phone = (String) body.get("phone");
        String text = (String) body.get("text");

        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(
                    "INSERT INTO saved_addresses (phone, address_text) VALUES (?, ?)",
                    Statement.RETURN_GENERATED_KEYS
            );
            ps.setString(1, phone);
            ps.setString(2, text);
            return ps;
        }, keyHolder);

        String newId = keyHolder.getKey() != null ? keyHolder.getKey().toString() : "0";
        return ResponseEntity.ok(Map.of("id", newId, "text", text));
    }
}