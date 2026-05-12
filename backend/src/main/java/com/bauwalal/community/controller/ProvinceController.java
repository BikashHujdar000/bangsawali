package com.bauwalal.community.controller;

import com.bauwalal.community.entity.Province;
import com.bauwalal.community.repository.ProvinceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/provinces")
@RequiredArgsConstructor
public class ProvinceController {
    private final ProvinceRepository provinceRepository;

    @GetMapping
    public List<Province> list() {
        return provinceRepository.findAll();
    }
}
