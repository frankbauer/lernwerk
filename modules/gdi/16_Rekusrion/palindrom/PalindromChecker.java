//#START STATIC
public class PalindromChecker {

    public static boolean istPalindrom(String wort) {
//#START STUDENT

        return false;
//#START SOLUTION
        // Abbruchfall: leere und einbuchstabige Wörter sind Palindrome
        if (wort == null || wort.length() <= 1) {
            return true;
        }

        String first = wort.substring(0, 1);
        String last = wort.substring(wort.length() - 1, wort.length());

        if (!first.equals(last)) {
            return false;
        }
        // äußere Buchstaben passen: das Innere muss ebenfalls ein Palindrom sein
        return istPalindrom(wort.substring(1, wort.length() - 1));
//#START STATIC
    }

    public static void main(String[] args) {
        String wort = "regallager";
        System.out.println(wort + " ist ein Palindrom: " + PalindromChecker.istPalindrom(wort));

        wort = "rentner";
        System.out.println(wort + " ist ein Palindrom: " + PalindromChecker.istPalindrom(wort));

        wort = "kaninchen";
        System.out.println(wort + " ist ein Palindrom: " + PalindromChecker.istPalindrom(wort));
    }
}
