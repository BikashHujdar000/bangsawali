package com.bauwalal.community.service;

import com.bauwalal.community.entity.Person;
import com.bauwalal.community.repository.FamilyRepository;
import com.bauwalal.community.repository.PersonRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;

/**
 * Read models for family screens: include people linked by parent/child/spouse edges even when their
 * {@link Person#getFamily()} points at another household (e.g. son branched to his own family).
 */
@Service
@RequiredArgsConstructor
public class FamilyViewService {
    private final FamilyRepository familyRepository;
    private final PersonRepository personRepository;

    public List<Person> listPersonsExtendedForDetail(Long familyId) {
        Long safeId = Objects.requireNonNull(familyId);
        var fam = familyRepository.findById(safeId).orElseThrow(() -> new RuntimeException("Family not found"));
        if (fam.isDeleted()) {
            throw new RuntimeException("Family not found");
        }
        Set<Long> seen = new LinkedHashSet<>();
        for (Person p : personRepository.findByFamilyIdAndDeletedFalse(safeId)) {
            seen.add(p.getId());
        }
        boolean changed = true;
        int guard = 0;
        while (changed && guard++ < 50) {
            changed = false;
            List<Person> layer = new ArrayList<>(personRepository.findAllById(new ArrayList<>(seen)));
            for (Person p : layer) {
                Person f = p.getFather();
                if (f != null && !f.isDeleted() && seen.add(f.getId())) {
                    changed = true;
                }
                Person mo = p.getMother();
                if (mo != null && !mo.isDeleted() && seen.add(mo.getId())) {
                    changed = true;
                }
                for (Person ch : personRepository.findActiveChildrenOfParent(p.getId())) {
                    if (seen.add(ch.getId())) {
                        changed = true;
                    }
                }
                Person sp = p.getSpouse();
                if (sp != null && !sp.isDeleted() && seen.add(sp.getId())) {
                    changed = true;
                }
            }
        }
        return personRepository.findAllById(new ArrayList<>(seen));
    }
}
