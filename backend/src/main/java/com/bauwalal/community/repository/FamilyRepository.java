package com.bauwalal.community.repository;

import com.bauwalal.community.entity.Family;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface FamilyRepository extends JpaRepository<Family, Long> {
    List<Family> findByPrimaryPersonId(Long primaryPersonId);

    List<Family> findByDeletedFalse();

    @Query("select f from Family f where coalesce(f.deleted, false) = false order by f.id desc")
    List<Family> listActiveOrderByIdDesc();

    @Query("select f from Family f where f.deleted = true order by f.id desc")
    List<Family> listSoftDeletedOrderByIdDesc();

    List<Family> findAllByOrderByIdDesc();

    long countByDeletedFalse();
}
