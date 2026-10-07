// Klasse Steuer zur Verwaltung von Steuerberechnungen
public class Steuer {
    // Klassenvariable mehrwertSteuer speichert den Mehrwertsteuersatz als Dezimalwert (19% = 0.19)
    public static double mehrwertSteuer = 0.19;
      
    // Methode zur Berechnung des Brutto-Preises aus einem gegebenen Netto-Preis
    public static double berechnePreis(double nettoPreis) {
        // Gibt den Netto-Preis zuzüglich der darauf berechneten Mehrwertsteuer zurück
        return nettoPreis * (1.0 + Steuer.mehrwertSteuer);
    }
      
    // Methode zum Setzen eines neuen Mehrwertsteuersatzes
    public static void setMehrwertSteuer(double prozent) {
        // Überprüft, ob der neue Prozentsatz gültig ist (zwischen 0 und 1)
        if (prozent >= 0 && prozent <= 1) {
            Steuer.mehrwertSteuer = prozent; // Setzt den neuen Mehrwertsteuersatz
        }
    }
      
    // Hauptmethode zum Ausführen der Steuerberechnungen
    public static void main(String[] args){
        // Berechnet den Brutto-Preis für einen gegebenen Netto-Preis von 9.99
        double p = Steuer.berechnePreis(9.99);
        // Gibt den berechneten Brutto-Preis aus
        System.out.println(p);
    }
}