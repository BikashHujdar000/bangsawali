package com.bauwalal.community.service;

import com.bauwalal.community.dto.TransactionCreateRequest;
import com.bauwalal.community.entity.FinancialTransaction;
import com.bauwalal.community.repository.FinancialTransactionRepository;
import com.bauwalal.community.repository.PersonRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TransactionService {
    private final FinancialTransactionRepository txRepository;
    private final PersonRepository personRepository;

    @Transactional
    public FinancialTransaction create(TransactionCreateRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean canManageTransactions = auth.getAuthorities().stream().anyMatch(a ->
                a.getAuthority().equals("ROLE_SUPER_ADMIN") || a.getAuthority().equals("ROLE_ADMIN"));
        if (!canManageTransactions) {
            throw new RuntimeException("Only admin or super admin can create transactions");
        }
        FinancialTransaction tx = new FinancialTransaction();
        tx.setPerson(personRepository.findById(request.getPersonId()).orElseThrow(() -> new RuntimeException("Person not found")));
        tx.setAmount(request.getAmount());
        tx.setType(request.getType());
        tx.setDescription(request.getDescription());
        tx.setApprovedBy(auth.getName());
        return txRepository.save(tx);
    }
}
