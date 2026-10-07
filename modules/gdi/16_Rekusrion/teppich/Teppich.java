//#START STATIC
public class Teppich {
    public static void teppich(Leinwand leinwand, int zeile, int spalte, int groesse) {
//#START STUDENT
        /* Hier könnte Ihr Code stehen */
//#START SOLUTION
        // Abbruchfall: ein einzelnes Feld wird gefüllt
        if (groesse == 1) {
            leinwand.fuellen(zeile, spalte);
            return;
        }

        // Kaskade: das Quadrat in 3 x 3 Teilquadrate zerlegen und
        // alle außer dem mittleren rekursiv zu einem Teppich machen
        int teil = groesse / 3;
        for (int i = 0; i < 3; i++) {
            for (int j = 0; j < 3; j++) {
                if (i != 1 || j != 1) {
                    teppich(leinwand, zeile + i * teil, spalte + j * teil, teil);
                }
            }
        }
//#START STATIC
    }

    public static void main(String[] args) {
        Leinwand leinwand = new Leinwand(27);
        teppich(leinwand, 0, 0, 27);
        System.out.println("Gefuellte Felder: " + leinwand.anzahlGefuellt());
    }
}
