package com.bauwalal.community.controller;

import com.bauwalal.community.dto.TransactionCreateRequest;
import com.bauwalal.community.entity.FinancialTransaction;
import com.bauwalal.community.repository.FinancialTransactionRepository;
import com.bauwalal.community.service.TransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {
    private final TransactionService transactionService;
    private final FinancialTransactionRepository repository;

    @GetMapping
    public List<FinancialTransaction> list() {
        return repository.findAll();
    }

    @PostMapping
    public FinancialTransaction create(@RequestBody TransactionCreateRequest request) {
        return transactionService.create(request);
    }
}
