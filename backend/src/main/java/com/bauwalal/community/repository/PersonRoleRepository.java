package com.bauwalal.community.repository;

import com.bauwalal.community.entity.PersonRole;
import com.bauwalal.community.enums.CommunityRoleCode;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PersonRoleRepository extends JpaRepository<PersonRole, Long> {
    Optional<PersonRole> findByCode(CommunityRoleCode code);
}
