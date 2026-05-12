package com.bauwalal.community.repository;

import com.bauwalal.community.entity.Province;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProvinceRepository extends JpaRepository<Province, Long> {
    Optional<Province> findByCode(Integer code);
}
