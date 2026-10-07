//#START STATIC
public class Recursion {
    // lineare Kopfrekursion: der rekursive Aufruf kommt zuerst, gerechnet wird danach
    public static int binStringToDec(String binaryNumber) {
        if (binaryNumber.length() == 0) {
            return 0;
        }

        int value = 0;
        if (binaryNumber.charAt(binaryNumber.length() - 1) == '1') value = 1;

        int zwErg = binStringToDec(binaryNumber.substring(0, binaryNumber.length() - 1));
        return value + 2 * zwErg;
    }

//#START STUDENT

//#START SOLUTION
    public static int binStringToDecTail(String binaryNumber) {
        return binStringToDecTail(binaryNumber, 0);
    }

    // Endrekursion: das Zwischenergebnis wird als Parameter mitgegeben,
    // der rekursive Aufruf ist die letzte Aktion
    private static int binStringToDecTail(String binaryNumber, int zwErg) {
        if (binaryNumber.length() == 0) {
            return zwErg;
        }

        int value = 0;
        if (binaryNumber.charAt(0) == '1') {
            value = 1;
        }

        int zwErgNeu = value + 2 * zwErg;
        return binStringToDecTail(binaryNumber.substring(1, binaryNumber.length()), zwErgNeu);
    }

//#START STATIC
    public static void main(String[] args) {
        System.out.println("Kopfrekursion:");
        System.out.println("1010 -> " + binStringToDec("1010"));
        System.out.println("11010010 -> " + binStringToDec("11010010"));

        System.out.println();
        System.out.println("Endrekursion:");
        System.out.println("1010 -> " + binStringToDecTail("1010"));
        System.out.println("11010010 -> " + binStringToDecTail("11010010"));
    }
}
