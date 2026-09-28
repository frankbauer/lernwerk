public class Umdreher {
    public static String dreheUm(String text) {
        // Abbruchfall: leere oder einbuchstabige Texte sind schon umgedreht
        if (text == null || text.length() <= 1) {
            return text;
        } // if
        char ersterBuchstabe = text.charAt(0);
        String rest = text.substring(1, text.length());
        String restUmgedreht = Umdreher.dreheUm(rest);
        return restUmgedreht + ersterBuchstabe;
    }

    public static void main(String[] args) {
        System.out.println(dreheUm("Beispiel"));
        System.out.println(dreheUm("Rekursion"));
    }
} // class
