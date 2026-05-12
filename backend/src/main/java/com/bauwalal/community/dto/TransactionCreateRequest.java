package com.bauwalal.community.dto;

import com.bauwalal.community.enums.TransactionType;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class TransactionCreateRequest {
    @NotNull
    private Long personId;
    @NotNull
    private BigDecimal amount;
    @NotNull
    private TransactionType type;
    private String description;
}
