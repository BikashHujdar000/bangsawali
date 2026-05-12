package com.bauwalal.community.repository;

import com.bauwalal.community.entity.PersonSpouseLink;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PersonSpouseLinkRepository extends JpaRepository<PersonSpouseLink, Long> {
    void deleteByPersonId(Long personId);

    @Modifying
    @Query("delete from PersonSpouseLink l where l.person.id = :pid or l.spouse.id = :pid")
    void deleteAllLinksTouchingPerson(@Param("pid") Long personId);
}
