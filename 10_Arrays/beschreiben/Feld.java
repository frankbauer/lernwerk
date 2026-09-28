//#START STATIC
public class Feld {
    public static void main(String[] args) {
        double[] data = {-3.4, 8, 19.5, 7.2, 42.0, -3.4, 0, -1000};
//#START STUDENT

//#START SOLUTION
        data[7] = 3.14;
//#START STATIC

        // Inhalt des Feldes ausgeben
        for (int i = 0; i < data.length; i++) {
            System.out.print(data[i] + ", ");
        }
    }
}
