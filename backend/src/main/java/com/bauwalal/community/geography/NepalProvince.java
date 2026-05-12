package com.bauwalal.community.geography;

/** Nepal federal provinces (7), codes 1–7. */
public final class NepalProvince {

    private NepalProvince() {}

    public static String nameEn(int code) {
        return switch (code) {
            case 1 -> "Koshi";
            case 2 -> "Madhesh";
            case 3 -> "Bagmati";
            case 4 -> "Gandaki";
            case 5 -> "Lumbini";
            case 6 -> "Karnali";
            case 7 -> "Sudurpashchim";
            default -> null;
        };
    }

    public static String nameNp(int code) {
        return switch (code) {
            case 1 -> "कोशी";
            case 2 -> "मधेश";
            case 3 -> "बागमती";
            case 4 -> "गण्डकी";
            case 5 -> "लुम्बिनी";
            case 6 -> "कर्णाली";
            case 7 -> "सुदूरपश्चिम";
            default -> null;
        };
    }
}
