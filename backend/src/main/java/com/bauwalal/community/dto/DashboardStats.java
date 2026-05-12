package com.bauwalal.community.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class DashboardStats {
    private long totalFamilies;
    private long totalPersons;
    private BigDecimal monthlyDeposits;
    private BigDecimal monthlyWithdrawals;
}
