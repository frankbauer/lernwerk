//#START STATIC
public class Iteration {
    // lineare Endrekursion
    public static int binStringToDec(String binaryNumber) {
        return binStringToDec(binaryNumber, 0);
    }

    private static int binStringToDec(String binaryNumber, int zwErg) {
        if (binaryNumber.length() == 0) {
            return zwErg;
        }

        int value = 0;
        if (binaryNumber.charAt(0) == '1') {
            value = 1;
        }

        int zwErgNeu = value + 2 * zwErg;
        return binStringToDec(binaryNumber.substring(1, binaryNumber.length()), zwErgNeu);
    }

//#START STUDENT

//#START SOLUTION
    public static int binStringToDecIter(String binaryNumber) {
        // der Parameter zwErg wird zur lokalen Variable, mit dem Startwert aus dem ersten Aufruf
        int zwErg = 0;
        // Schleifenbedingung = Negation des Abbruchfalls
        while (!(binaryNumber.length() == 0)) {
            int value = 0;
            if (binaryNumber.charAt(0) == '1') {
                value = 1;
            }
            // statt des rekursiven Aufrufs: Parameter neu setzen
            zwErg = value + 2 * zwErg;
            binaryNumber = binaryNumber.substring(1, binaryNumber.length());
        }
        return zwErg;
    }

//#START STATIC
    public static void main(String[] args) {
        System.out.println("Endrekursion:");
        System.out.println("1010 -> " + binStringToDec("1010"));
        System.out.println("11010010 -> " + binStringToDec("11010010"));

        System.out.println();
        System.out.println("Iterativ:");
        System.out.println("1010 -> " + binStringToDecIter("1010"));
        System.out.println("11010010 -> " + binStringToDecIter("11010010"));
    }
}
