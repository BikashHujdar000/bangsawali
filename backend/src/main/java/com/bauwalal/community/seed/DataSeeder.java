package com.bauwalal.community.seed;

import com.bauwalal.community.entity.*;
import com.bauwalal.community.geography.NepalDistrictProvinceCodes;
import com.bauwalal.community.geography.NepalProvince;

import com.bauwalal.community.enums.AppRole;
import com.bauwalal.community.enums.CommunityRoleCode;
import com.bauwalal.community.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.IntStream;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {
    private final AppUserRepository userRepository;
    private final PersonRoleRepository personRoleRepository;
    private final ProvinceRepository provinceRepository;
    private final DistrictRepository districtRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (personRoleRepository.findByCode(CommunityRoleCode.PRESIDENT).isEmpty()) {
            PersonRole president = new PersonRole();
            president.setCode(CommunityRoleCode.PRESIDENT);
            personRoleRepository.save(president);
        }
        if (personRoleRepository.findByCode(CommunityRoleCode.MEMBER).isEmpty()) {
            PersonRole member = new PersonRole();
            member.setCode(CommunityRoleCode.MEMBER);
            personRoleRepository.save(member);
        }

        if (provinceRepository.count() == 0) {
            for (Province province : seedProvinces()) {
                provinceRepository.save(Objects.requireNonNull(province));
            }
        }
        backfillProvinces();
        List<Province> provinces = provinceRepository.findAll();
        Map<Integer, Province> provinceByCode = provinces.stream()
                .collect(Collectors.toMap(Province::getCode, Function.identity()));

        ensureDistrictCatalog(provinceByCode);
        backfillDistrictProvinces(provinceByCode);

        if (userRepository.findByUsername("superadmin").isEmpty()) {
            AppUser user = new AppUser();
            user.setUsername("superadmin");
            user.setPasswordHash(passwordEncoder.encode("admin123"));
            user.setBranchCode("HQ");
            user.setRole(AppRole.SUPER_ADMIN);
            user.setPasswordChangeRequired(true);
            userRepository.save(user);
        } else {
            AppUser user = userRepository.findByUsername("superadmin").orElseThrow();
            boolean dirty = false;
            if (user.getRole() == null) {
                user.setRole(AppRole.SUPER_ADMIN);
                dirty = true;
            }
            if (passwordEncoder.matches("admin123", user.getPasswordHash()) && !user.isPasswordChangeRequired()) {
                user.setPasswordChangeRequired(true);
                dirty = true;
            }
            if (dirty) {
                userRepository.save(user);
            }
        }
        if (userRepository.findByUsername("admin").isEmpty()) {
            AppUser user = new AppUser();
            user.setUsername("admin");
            user.setPasswordHash(passwordEncoder.encode("admin123"));
            user.setBranchCode("HQ");
            user.setRole(AppRole.ADMIN);
            userRepository.save(user);
        } else {
            AppUser user = userRepository.findByUsername("admin").orElseThrow();
            if (user.getRole() == null) {
                user.setRole(AppRole.ADMIN);
                userRepository.save(user);
            }
        }
        if (userRepository.findByUsername("viewer").isEmpty()) {
            AppUser user = new AppUser();
            user.setUsername("viewer");
            user.setPasswordHash(passwordEncoder.encode("viewer123"));
            user.setBranchCode("HQ");
            user.setRole(AppRole.USER);
            userRepository.save(user);
        } else {
            AppUser user = userRepository.findByUsername("viewer").orElseThrow();
            if (user.getRole() == null) {
                user.setRole(AppRole.USER);
                userRepository.save(user);
            }
        }
    }

    private Province province(int code) {
        Province p = new Province();
        p.setCode(code);
        p.setNameEn(NepalProvince.nameEn(code));
        p.setNameNp(NepalProvince.nameNp(code));
        return p;
    }

    private District district(String code, String en, String np, int provinceCode, Province province) {
        District d = new District();
        d.setCode(code);
        d.setNameEn(en);
        d.setNameNp(np);
        d.setProvince(province);
        d.setProvinceCode(provinceCode);
        d.setProvinceNameEn(NepalProvince.nameEn(provinceCode));
        return d;
    }

    private List<Province> seedProvinces() {
        return IntStream.rangeClosed(1, 7)
                .mapToObj(this::province)
                .toList();
    }

    private void backfillProvinces() {
        for (int code = 1; code <= 7; code++) {
            if (provinceRepository.findByCode(code).isPresent()) {
                continue;
            }
            provinceRepository.save(Objects.requireNonNull(province(code)));
        }
    }

    private void ensureDistrictCatalog(Map<Integer, Province> provinceByCode) {
        Map<String, District> existingByName = districtRepository.findAll().stream()
                .collect(Collectors.toMap(District::getNameEn, Function.identity(), (a, b) -> a));

        List<District> toInsert = IntStream.range(0, NepalDistrictProvinceCodes.DISTRICT_NAMES_EN.size())
                .filter(index -> !existingByName.containsKey(NepalDistrictProvinceCodes.DISTRICT_NAMES_EN.get(index)))
                .mapToObj(index -> district(
                        String.format("D%03d", index + 1),
                        NepalDistrictProvinceCodes.DISTRICT_NAMES_EN.get(index),
                        NepalDistrictProvinceCodes.DISTRICT_NAMES_NP.get(index),
                        NepalDistrictProvinceCodes.BY_LIST_INDEX[index],
                        provinceByCode.get(NepalDistrictProvinceCodes.BY_LIST_INDEX[index])))
                .toList();

        for (District district : toInsert) {
            districtRepository.save(Objects.requireNonNull(district));
        }
    }

    private void backfillDistrictProvinces(Map<Integer, Province> provinceByCode) {
        List<District> all = districtRepository.findAll();
        boolean dirty = false;
        for (District d : all) {
            int idx = NepalDistrictProvinceCodes.DISTRICT_NAMES_EN.indexOf(d.getNameEn());
            if (idx < 0) {
                continue;
            }
            int code = NepalDistrictProvinceCodes.BY_LIST_INDEX[idx];
            Province province = provinceByCode.get(code);
            if (province == null) {
                continue;
            }
            String expectedNp = NepalDistrictProvinceCodes.DISTRICT_NAMES_NP.get(idx);

            if (d.getProvince() == null) {
                d.setProvince(Objects.requireNonNull(province));
                dirty = true;
            }
            if (!Objects.equals(d.getProvinceCode(), code)) {
                d.setProvinceCode(code);
                dirty = true;
            }
            if (!Objects.equals(d.getProvinceNameEn(), NepalProvince.nameEn(code))) {
                d.setProvinceNameEn(NepalProvince.nameEn(code));
                dirty = true;
            }
            if (!Objects.equals(d.getNameNp(), expectedNp)) {
                d.setNameNp(expectedNp);
                dirty = true;
            }
        }
        if (dirty) {
            districtRepository.saveAll(all);
        }
    }
}
