package com.bauwalal.community.repository;

import com.bauwalal.community.entity.PersonRoleMap;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PersonRoleMapRepository extends JpaRepository<PersonRoleMap, Long> {
    @Query("select count(m) > 0 from PersonRoleMap m where m.district.id = :districtId and m.role.code = 'PRESIDENT' and m.person.deleted = false")
    boolean existsPresidentInDistrict(@Param("districtId") Long districtId);

    @Query("select count(m) > 0 from PersonRoleMap m where m.person.id = :personId and m.role.code = 'PRESIDENT' and m.person.deleted = false")
    boolean personIsPresident(@Param("personId") Long personId);

    @Modifying
    @Query("delete from PersonRoleMap m where m.person.id = :personId")
    void deleteAllForPerson(@Param("personId") Long personId);
}
