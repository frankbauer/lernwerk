//#START STATIC
public class MultiplesOfPi {
    public static void main(String[] args) {
        final int N = 10;
//#START STUDENT

//#START SOLUTION
        // Akkumulator: startet bei 0 und sammelt in jedem Durchlauf einen Summanden auf
        double sum = 0;
        for (int k = 1; k <= N; k++) {
            sum += k * Math.PI;
        }
//#START STATIC
        System.out.println("Die Summe der ersten " + N + " Vielfachen von Pi ist " + sum);
    }
}
