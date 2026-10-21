//#START STATIC
public class UnixTime {
    public static void main(String[] args) {
        final int SECONDS_PER_DAY = (24 * 60 * 60);
        final int SECONDS_PER_HOUR = (60 * 60);
        // Tage in einem 400-Jahres-Zyklus: 97 Schalttage
        final int DAYS_PER_ERA = (400 * 365 + 97);
        // Tage vom 1.3.0000 bis zum 1.1.1970: 5 Zyklen bis
        // zum 1.3.2000, minus Januar und Februar 1970 (59),
        // 30 Jahre und 8 Schalttage bis zum 1.3.2000
        final int DAYS_TO_1970 =
                5 * DAYS_PER_ERA - (59 + 30 * 365 + 8);
        // März bis Juli (Muster wiederholt sich)
        final int DAYS_PER_5_MONTHS = (31 + 30 + 31 + 30 + 31);

        // Liest den Zeitstempel (Sekunden seit dem 1.1.1970, 00:00 Uhr UTC) 
        // aus den Programmargumenten
        int timestamp = Input.getTimestamp(args);

        // Schritt 1: ganze Tage und Uhrzeit
//#START STUDENT
        int days = 0;
        int hour = 0;
        int minute = 0;
        int second = 0;
//#START SOLUTION
        int days = timestamp / SECONDS_PER_DAY;
        int secondsOfDay = timestamp % SECONDS_PER_DAY;
        int hour = secondsOfDay / SECONDS_PER_HOUR;
        int minute = (secondsOfDay % SECONDS_PER_HOUR) / 60;
        int second = secondsOfDay % 60;
//#START STATIC

        // Schritt 2: Zählbeginn auf den 1.3.0000 verschieben
        int shifted = days + DAYS_TO_1970;

        // Schritt 3: vollständige 400-Jahres-Zyklen 
        // und Tag innerhalb des Zyklus
//#START STUDENT
        int era = 0;
        int dayOfEra = 0;
//#START SOLUTION
        int era = shifted / DAYS_PER_ERA;
        int dayOfEra = shifted % DAYS_PER_ERA;
//#START STATIC

        // Schritt 4: Jahr innerhalb des Zyklus (0 bis 399)
        // angefallene Schalttage: alle 4 Jahre einer
        int leapAdded = dayOfEra / (4 * 365);
        // ausgefallene Schalttage: alle 100 Jahre einer
        int leapSkipped = dayOfEra / (100 * 365 + 24);
        // Schalttag am letzten Tag des Zyklus (29.2.0400)
        int leapAtEnd = dayOfEra / (DAYS_PER_ERA - 1);
        // Schalttage bis zu diesem Tag
        int leapDays = leapAdded - leapSkipped + leapAtEnd;
        // ohne Schalttage hat jedes Jahr 365 Tage
        int yearOfEra = (dayOfEra - leapDays) / 365;

        // Schritt 5: Tag im (ab März gezählten) Jahr
        // Tage aller vorherigen Jahre im Zyklus
        int daysBefore = 365 * yearOfEra;
        daysBefore = daysBefore + yearOfEra / 4;
        daysBefore = daysBefore - yearOfEra / 100;
        int dayOfYear = dayOfEra - daysBefore;

        // Schritt 6: Monat ab März gezählt 
        // (0 = März, ..., 11 = Februar) und Tag im Monat
        int monthIndex =
                (5 * dayOfYear + 2) / DAYS_PER_5_MONTHS;
        int firstDayOfMonth =
                (DAYS_PER_5_MONTHS * monthIndex + 2) / 5;
        int day = dayOfYear - firstDayOfMonth + 1;

        // Schritt 7: zurück zum gewohnten Kalender 
        // (Januar = 1, Jahr beginnt im Januar)
//#START STUDENT
        int month = 0;
        int year = 0;
//#START SOLUTION
        int month = (monthIndex + 2) % 12 + 1;
        int year = 400 * era + yearOfEra;
        year = year + (monthIndex + 2) / 12;
//#START STATIC

        System.out.println("Zeitstempel: " + timestamp);
        System.out.println("Datum: " + day + "." + month + "." + year);
        
        System.out.print("Uhrzeit: " + hour + " Uhr");
        System.out.print(" " + minute + " Minuten");
        System.out.println(" " + second + " Sekunden");
    }
}
//#START API
class Input {
    protected static int getTimestamp(String[] args) {
        if (args.length == 0) return 0;
        try {
            return (int) Double.parseDouble(args[0]);
        } catch (Exception e) {
            return 0;
        }
    }
}
