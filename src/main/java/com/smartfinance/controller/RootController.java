package com.smartfinance.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class RootController {
    @GetMapping("/")
    public Map<String, String> getServiceStatus() {
        return Map.of(
            "service", "SmartFinance Backend API",
            "status", "UP",
            "version", "1.0.0"
        );
    }
}
