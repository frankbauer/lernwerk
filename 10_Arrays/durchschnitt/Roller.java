//#START STATIC
public class Roller {
    public static void main(String[] args) {
        int[] data = {3, 2, 4, 9, 7, -4, 4, 1};
//#START STUDENT

//#START SOLUTION
        double[] rollingAvgs = new double[data.length];

        for (int i = 0; i < rollingAvgs.length; i++) {
            int counter = 0;
            double sum = 0;

            // das Element selbst und (soweit vorhanden) seine drei Vorgänger
            for (int j = Math.max(0, i - 3); j <= i; j++) {
                counter++;
                sum += data[j];
            }

            rollingAvgs[i] = sum / counter;
        }

        for (int i = 0; i < rollingAvgs.length; i++) {
            System.out.print(rollingAvgs[i] + " ");
        }
//#START STATIC
    }
}
