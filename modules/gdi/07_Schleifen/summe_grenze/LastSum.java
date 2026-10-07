//#START STATIC
public class LastSum {
    public static void main(String[] args) {
        final int limit = Input.getLimit(args);
//#START STUDENT

//#START SOLUTION
        int sum = 0;
        int n = 0;
        // Endlosschleife: wird nur über break verlassen
        while (true) {
            n++;
            // Würde die Summe mit dem nächsten Summanden die Grenze erreichen, wird abgebrochen
            if (sum + n >= limit) {
                break;
            }
            sum += n;
        }
//#START STATIC
        System.out.println("Die letzte Summe 1 + 2 + 3 + ... kleiner als " + limit + " ist " + sum);
    }
}
//#START API
class Input {
    protected static int getLimit(String[] args) {
        try {
            return Integer.parseInt(args[0].trim());
        } catch (Exception e) {
            return 1000;
        }
    }
}
