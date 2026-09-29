//#START STATIC
public class SimpleEnigma {
//#START API
    private Walze[] komponenten;
    private int anzahlKomponenten;

    public SimpleEnigma() {
        komponenten = new Walze[3];
        anzahlKomponenten = 0;
    }

    public void addComponent(Walze komponente) {
        if (komponente == null) {
            System.err.println("The added component is null and is therefore being discarded!");
            return;
        }
        if (anzahlKomponenten < 3) {
            komponenten[anzahlKomponenten] = komponente;
            anzahlKomponenten++;
        }
    }

    public String encryptSentence(String sentence) {
        char[] result = sentence.toCharArray();
        for (int i = 0; i < result.length; i++) {
            char c = result[i];
            if (c == ' ') continue;
            for (int j = 0; j < anzahlKomponenten; j++) {
                c = komponenten[j].encrypt(c);
            }
            result[i] = c;
        }
        return String.valueOf(result);
    }

    public String decryptSentence(String sentence) {
        char[] result = sentence.toCharArray();
        for (int i = 0; i < result.length; i++) {
            char c = result[i];
            if (c == ' ') continue;
            for (int j = anzahlKomponenten - 1; j >= 0; j--) {
                c = komponenten[j].decrypt(c);
            }
            result[i] = c;
        }
        return String.valueOf(result);
    }

//#START STATIC
    public static void main(String[] args) {
//#START STUDENT
        SimpleEnigma enigma = new SimpleEnigma();
        // enigma.addComponent(new Walze(Helper.getMapping()));
        String satz = "Testen ist wichtig!";
        String en = enigma.encryptSentence(satz);
        String de = enigma.decryptSentence(en);
        System.out.println(satz);
        System.out.println(en);
        System.out.println(de);
//#START SOLUTION
        SimpleEnigma enigma = new SimpleEnigma();
        Walze w1 = new Walze(Helper.getMapping());
        Walze w2 = new Walze(Helper.getMapping());
        enigma.addComponent(w1);
        enigma.addComponent(w2);

        String satz = "Hallo Welt!";
        String satz2 = "Testen ist wichtig!";
        String en = enigma.encryptSentence(satz);
        String en2 = enigma.encryptSentence(satz2);
        String de = enigma.decryptSentence(en);
        String de2 = enigma.decryptSentence(en2);

        System.out.println("    Input: " + satz);
        System.out.println("Encrypted: " + en);
        System.out.println("Decrypted: " + de);
        System.out.println("-------------------------");
        System.out.println("    Input: " + satz2);
        System.out.println("Encrypted: " + en2);
        System.out.println("Decrypted: " + de2);
//#START STATIC
    }
}

//#START API
class Helper {
    private static final int[][] MAPPINGS = {
        {15, 10, 7, 14, 20, 2, 25, 4, 0, 6, 3, 11, 18, 16, 12, 1, 13, 22, 23, 5, 19, 24, 21, 8, 9, 17},
        {19, 17, 18, 0, 24, 6, 2, 25, 14, 8, 15, 23, 12, 3, 21, 20, 11, 1, 9, 10, 13, 5, 7, 4, 16, 22},
        {9, 16, 1, 14, 8, 18, 17, 3, 24, 12, 23, 22, 25, 7, 5, 11, 4, 2, 0, 19, 6, 10, 13, 20, 21, 15},
        {6, 2, 19, 4, 14, 0, 12, 3, 13, 1, 11, 20, 16, 17, 15, 7, 25, 10, 9, 8, 18, 5, 23, 24, 22, 21},
        {16, 13, 2, 15, 9, 12, 22, 7, 10, 6, 17, 11, 0, 24, 20, 25, 8, 5, 18, 23, 1, 4, 3, 19, 21, 14},
        {11, 14, 17, 6, 23, 18, 21, 24, 5, 10, 20, 19, 8, 22, 9, 15, 13, 3, 0, 7, 1, 12, 16, 2, 25, 4},
        {8, 5, 4, 3, 14, 25, 19, 13, 6, 15, 22, 10, 20, 2, 21, 16, 7, 18, 24, 12, 1, 0, 23, 17, 9, 11},
        {6, 17, 7, 12, 25, 15, 11, 1, 0, 8, 5, 16, 24, 21, 4, 20, 18, 22, 2, 14, 10, 9, 23, 3, 19, 13},
        {0, 25, 14, 24, 3, 22, 21, 1, 15, 18, 13, 12, 20, 10, 17, 23, 5, 6, 2, 16, 4, 7, 9, 19, 11, 8},
        {24, 9, 14, 25, 5, 18, 1, 12, 21, 0, 17, 20, 8, 4, 7, 13, 11, 16, 19, 10, 3, 2, 6, 15, 23, 22}
    };
    private static int mapIndex = 0;

    public static int[] getMapping() {
        int[] mapping = MAPPINGS[mapIndex].clone();
        mapIndex = (mapIndex + 1) % MAPPINGS.length;
        return mapping;
    }

    public static int getIndexFromChar(char c) {
        int res = Character.toLowerCase(c) - 'a';
        if (res < 0 || res > 25) return -1;
        return res;
    }

    public static char getCharFromIndex(int i) {
        if (i < 0 || i > 25) return '?';
        return (char) ('a' + i);
    }
}
