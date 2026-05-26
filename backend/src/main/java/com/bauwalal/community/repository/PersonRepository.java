package com.bauwalal.community.repository;

import com.bauwalal.community.entity.Person;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PersonRepository extends JpaRepository<Person, Long>, JpaSpecificationExecutor<Person> {
    /** Household list + family directory: load relation edges so JSON includes parents/spouse for summaries. */
    @EntityGraph(attributePaths = {"family", "district", "father", "mother", "spouse"})
    List<Person> findByDeletedFalse();

    List<Person> findByFamilyIdAndDeletedFalse(Long familyId);
    List<Person> findByFamilyId(Long familyId);
    long countByDeletedFalse();

    @EntityGraph(attributePaths = {"family", "district", "father", "mother", "spouse"})
    @Query("select p from Person p where p.deleted=false and (cast(p.id as string) like concat('%', :term, '%') or lower(p.nameEn) like lower(concat('%', :term, '%')) or lower(p.nameNp) like lower(concat('%', :term, '%')))")
    List<Person> searchActive(@Param("term") String term);

    @Query("select p from Person p where p.deleted = false and (p.father.id = :pid or p.mother.id = :pid)")
    List<Person> findActiveChildrenOfParent(@Param("pid") Long parentId);

    @Modifying
    @Query("update Person p set p.spouse = null where p.spouse.id = :pid")
    int clearSpouseReferencesTo(@Param("pid") Long personId);

    @Modifying
    @Query("update Person p set p.father = null where p.father.id = :pid")
    int clearFatherReferencesTo(@Param("pid") Long personId);

    @Modifying
    @Query("update Person p set p.mother = null where p.mother.id = :pid")
    int clearMotherReferencesTo(@Param("pid") Long personId);
}
