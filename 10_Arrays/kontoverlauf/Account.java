//#START STATIC
public class Account {
    public static void main(String[] args) {
        final int start = 100;
        int[] bookings = {250, -400, 80, -120, 300, -90, -200, 50, 160};
//#START STUDENT

//#START SOLUTION
        // Akkumulator für den aktuellen Kontostand
        int balance = start;
        // Tiefster Stand bisher: vor der ersten Buchung ist das der Startbetrag
        int min = start;
        for (int i = 0; i < bookings.length; i++) {
            balance += bookings[i];
            if (balance < min) {
                min = balance;
            }
        }
//#START STATIC
        System.out.println("Endstand: " + balance);
        System.out.println("Tiefster Stand: " + min);
    }
}
