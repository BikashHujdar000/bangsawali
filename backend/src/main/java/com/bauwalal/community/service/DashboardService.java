package com.bauwalal.community.service;

import com.bauwalal.community.dto.DashboardStats;
import com.bauwalal.community.enums.TransactionType;
import com.bauwalal.community.repository.FamilyRepository;
import com.bauwalal.community.repository.FinancialTransactionRepository;
import com.bauwalal.community.repository.PersonRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class DashboardService {
    private final FamilyRepository familyRepository;
    private final PersonRepository personRepository;
    private final FinancialTransactionRepository txRepository;

    public DashboardStats stats() {
        Instant end = Instant.now();
        Instant start = end.minusSeconds(30L * 24 * 60 * 60);
        DashboardStats stats = new DashboardStats();
        stats.setTotalFamilies(familyRepository.countByDeletedFalse());
        stats.setTotalPersons(personRepository.countByDeletedFalse());
        stats.setMonthlyDeposits(txRepository.sumByTypeAndPeriod(TransactionType.DEPOSIT, start, end));
        stats.setMonthlyWithdrawals(txRepository.sumByTypeAndPeriod(TransactionType.WITHDRAW, start, end));
        return stats;
    }
}
