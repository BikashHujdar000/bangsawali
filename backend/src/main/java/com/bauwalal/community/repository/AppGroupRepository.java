package com.bauwalal.community.repository;

import com.bauwalal.community.entity.AppGroup;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AppGroupRepository extends JpaRepository<AppGroup, Long> {
    Optional<AppGroup> findByName(String name);
}
