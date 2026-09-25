//#START STATIC
public class LeapYear {
    public static void main(String[] args) {
        int year = 1600 + (int)(Math.random() * 500);
        final boolean leapYear;

//#START STUDENT

//#START SOLUTION
        if (year % 4 == 0) {
            // Regel 2: Säkularjahre sind keine Schaltjahre ...
            if (year % 100 == 0) {
                // Regel 3: ... außer sie sind durch 400 teilbar
                if (year % 400 == 0) {
                    leapYear = true;
                } else {
                    leapYear = false;
                }
            } else {
                // Regel 1: durch 4 teilbar
                leapYear = true;
            }
        } else {
            leapYear = false;
        }
//#START STATIC

        if (leapYear) {
            System.out.println(year + " ist ein Schaltjahr.");
        } else {
            System.out.println(year + " ist kein Schaltjahr.");
        }
    }
}
