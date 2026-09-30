//#START STATIC
public class DigitSum {
    public static void main(String[] args) {
        final int number = Input.getNumber(args);
//#START STUDENT

//#START SOLUTION
        // Akkumulator für die Summe der Ziffern
        int sum = 0;
        // Kopie der Zahl, von der Ziffer für Ziffer abgeschnitten wird
        int rest = number;
        while (rest > 0) {
            sum += rest % 10;
            rest /= 10;
        }
//#START STATIC
        System.out.println("Die Quersumme von " + number + " ist " + sum);
    }
}
//#START API
class Input {
    protected static int getNumber(String[] args) {
        try {
            return Integer.parseInt(args[0].trim());
        } catch (Exception e) {
            return 4711;
        }
    }
}
