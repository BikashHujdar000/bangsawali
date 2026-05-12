package com.bauwalal.community.service;

import com.bauwalal.community.dto.AssignRoleRequest;
import com.bauwalal.community.entity.PersonRoleMap;
import com.bauwalal.community.enums.CommunityRoleCode;
import com.bauwalal.community.repository.DistrictRepository;
import com.bauwalal.community.repository.PersonRepository;
import com.bauwalal.community.repository.PersonRoleMapRepository;
import com.bauwalal.community.repository.PersonRoleRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RoleAssignmentService {
    private final PersonRoleMapRepository mapRepository;
    private final PersonRoleRepository roleRepository;
    private final PersonRepository personRepository;
    private final DistrictRepository districtRepository;

    @Transactional
    public PersonRoleMap assign(AssignRoleRequest request) {
        if (request.getRoleCode() == CommunityRoleCode.PRESIDENT && mapRepository.existsPresidentInDistrict(request.getDistrictId())) {
            throw new RuntimeException("District already has a president");
        }
        PersonRoleMap map = new PersonRoleMap();
        map.setPerson(personRepository.findById(request.getPersonId()).orElseThrow(() -> new RuntimeException("Person not found")));
        map.setDistrict(districtRepository.findById(request.getDistrictId()).orElseThrow(() -> new RuntimeException("District not found")));
        map.setRole(roleRepository.findByCode(request.getRoleCode()).orElseThrow(() -> new RuntimeException("Role not seeded")));
        return mapRepository.save(map);
    }
}
