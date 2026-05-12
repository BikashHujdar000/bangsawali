package com.bauwalal.community.entity;

import com.bauwalal.community.enums.TransactionType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "financial_transactions")
@Getter
@Setter
public class FinancialTransaction extends BaseEntity {
    @ManyToOne(optional = false)
    private Person person;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionType type;

    private String description;
    private String approvedBy;

    @Column(nullable = false)
    private Instant occurredAt = Instant.now();
}
