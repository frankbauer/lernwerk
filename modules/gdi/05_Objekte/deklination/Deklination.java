//#START STATIC
public class Deklination {
    public static void main(String[] args) {
        final double EARTH_TILT_RAD = Math.toRadians(-23.44);
//#START STUDENT

//#START SOLUTION
        // Instanz von DateParser erzeugen und den Tag des Jahres abfragen
        DateParser parser = new DateParser(args);
        final int D = parser.getDayOfYear();
        System.out.println("Tag im Jahr: " + D);

        // Math.cos erwartet den Winkel im Bogenmaß
        final double orbitalAngle = Math.toRadians((360.0 * (D + 10)) / 365.0);
        final double declination = EARTH_TILT_RAD * Math.cos(orbitalAngle);
        System.out.println("Deklination: " + Math.toDegrees(declination));
//#START STATIC
    }
}
//#START API
class DateParser {
    private final String[] args;

    public DateParser(String[] args) {
        this.args = args;
    }

    // Erwartet das Datum im Format JJJJ-MM-TT (Wert des Datumsfeldes)
    public int getDayOfYear() {
        try {
            String[] parts = args[0].split("-");
            int year = Integer.parseInt(parts[0]);
            int month = Integer.parseInt(parts[1]);
            int day = Integer.parseInt(parts[2]);
            boolean leap = (year % 4 == 0 && year % 100 != 0) || year % 400 == 0;
            int[] daysPerMonth = {31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31};
            for (int m = 0; m < month - 1; m++) {
                day += daysPerMonth[m];
            }
            return day;
        } catch (Exception e) {
            return 1;
        }
    }
}
