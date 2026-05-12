package com.bauwalal.community.controller;

import com.bauwalal.community.entity.District;
import com.bauwalal.community.repository.DistrictRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/districts")
@RequiredArgsConstructor
public class DistrictController {
    private final DistrictRepository districtRepository;

    @GetMapping
    public List<District> list() {
        return districtRepository.findAll();
    }
}
