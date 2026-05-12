package com.bauwalal.community.geography;

import java.util.List;

/**
 * Nepal’s 77 districts (English names) and federal province code (1–7) per index.
 * Province names: {@link NepalProvince}.
 */
public final class NepalDistrictProvinceCodes {

    /** Same order as seed data — keep aligned with {@link #BY_LIST_INDEX}. */
    public static final List<String> DISTRICT_NAMES_EN = List.of(
            "Achham", "Arghakhanchi", "Baglung", "Baitadi", "Bajhang", "Bajura", "Banke", "Bara",
            "Bardiya", "Bhaktapur", "Bhojpur", "Chitwan", "Dadeldhura", "Dailekh", "Dang", "Darchula",
            "Dhading", "Dhankuta", "Dhanusa", "Dolakha", "Dolpa", "Doti", "Eastern Rukum", "Gorkha",
            "Gulmi", "Humla", "Ilam", "Jajarkot", "Jhapa", "Jumla", "Kailali", "Kalikot", "Kanchanpur",
            "Kapilvastu", "Kaski", "Kathmandu", "Kavrepalanchok", "Khotang", "Lalitpur", "Lamjung",
            "Mahottari", "Makwanpur", "Manang", "Morang", "Mugu", "Mustang", "Myagdi", "Nawalpur",
            "Nuwakot", "Okhaldhunga", "Palpa", "Panchthar", "Parasi", "Parbat", "Parsa", "Pyuthan",
            "Ramechhap", "Rasuwa", "Rautahat", "Rolpa", "Rupandehi", "Salyan", "Sankhuwasabha",
            "Saptari", "Sarlahi", "Sindhuli", "Sindhupalchok", "Siraha", "Solukhumbu", "Sunsari",
            "Surkhet", "Syangja", "Tanahun", "Taplejung", "Terhathum", "Udayapur", "Western Rukum"
    );

    /** Nepali district names aligned by index with {@link #DISTRICT_NAMES_EN}. */
    public static final List<String> DISTRICT_NAMES_NP = List.of(
            "अछाम", "अर्घाखाँची", "बागलुङ", "बैतडी", "बझाङ", "बाजुरा", "बाँके", "बारा",
            "बर्दिया", "भक्तपुर", "भोजपुर", "चितवन", "डडेलधुरा", "दैलेख", "दाङ", "दार्चुला",
            "धादिङ", "धनकुटा", "धनुषा", "दोलखा", "डोल्पा", "डोटी", "पूर्वी रुकुम", "गोरखा",
            "गुल्मी", "हुम्ला", "इलाम", "जाजरकोट", "झापा", "जुम्ला", "कैलाली", "कालिकोट", "कञ्चनपुर",
            "कपिलवस्तु", "कास्की", "काठमाडौं", "काभ्रेपलाञ्चोक", "खोटाङ", "ललितपुर", "लमजुङ",
            "महोत्तरी", "मकवानपुर", "मनाङ", "मोरङ", "मुगु", "मुस्ताङ", "म्याग्दी", "नवलपुर",
            "नुवाकोट", "ओखलढुंगा", "पाल्पा", "पाँचथर", "परासी", "पर्वत", "पर्सा", "प्युठान",
            "रामेछाप", "रसुवा", "रौतहट", "रोल्पा", "रूपन्देही", "सल्यान", "संखुवासभा",
            "सप्तरी", "सर्लाही", "सिन्धुली", "सिन्धुपाल्चोक", "सिराहा", "सोलुखुम्बु", "सुनसरी",
            "सुर्खेत", "स्याङ्जा", "तनहुँ", "ताप्लेजुङ", "तेह्रथुम", "उदयपुर", "पश्चिमी रुकुम"
    );

    /** Province code (1–7) for each district in {@link #DISTRICT_NAMES_EN} (77 values). */
    public static final int[] BY_LIST_INDEX = {
            7, 5, 4, 7, 7, 7, 5, 2, 5, 3, 1, 3, 7, 6, 5, 7, 3, 1, 2, 3, 6, 7, 5, 4, 5, 6, 1, 6, 1, 6, 7, 6, 7, 5, 4, 3, 3, 1, 3, 4, 2, 3, 4, 1, 6, 4, 4, 4, 3, 1, 5, 1, 5, 4, 2, 5, 3, 3, 2, 5, 5, 5, 1, 2, 2, 3, 3, 2, 1, 1, 6, 4, 4, 1, 1, 1, 6,
    };

    static {
        if (DISTRICT_NAMES_EN.size() != BY_LIST_INDEX.length) {
            throw new IllegalStateException(
                    "District names (" + DISTRICT_NAMES_EN.size() + ") != province codes (" + BY_LIST_INDEX.length + ")");
        }
        if (DISTRICT_NAMES_NP.size() != BY_LIST_INDEX.length) {
            throw new IllegalStateException(
                    "District NP names (" + DISTRICT_NAMES_NP.size() + ") != province codes (" + BY_LIST_INDEX.length + ")");
        }
    }

    private NepalDistrictProvinceCodes() {}
}
