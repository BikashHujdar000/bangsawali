package com.bauwalal.community.controller;

import com.bauwalal.community.dto.DashboardStats;
import com.bauwalal.community.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {
    private final DashboardService dashboardService;

    @GetMapping("/stats")
    public DashboardStats stats() {
        return dashboardService.stats();
    }
}
