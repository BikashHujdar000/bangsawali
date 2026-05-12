package com.bauwalal.community.repository;

import com.bauwalal.community.entity.FinancialTransaction;
import com.bauwalal.community.enums.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.Instant;

public interface FinancialTransactionRepository extends JpaRepository<FinancialTransaction, Long> {
    @Query("select coalesce(sum(t.amount),0) from FinancialTransaction t where t.type = :type and t.occurredAt between :start and :end")
    BigDecimal sumByTypeAndPeriod(@Param("type") TransactionType type, @Param("start") Instant start, @Param("end") Instant end);

    @Modifying
    @Query("delete from FinancialTransaction t where t.person.id = :personId")
    void deleteAllForPerson(@Param("personId") Long personId);
}
