//#START STATIC
public class Changer {
    public static void main(String[] args) {
        int[] data = {3, 2, 8, 5, 9, 1};
//#START STUDENT

//#START SOLUTION
        for (int i = 0; i < data.length; i++) {
            if (data[i] % 2 != 0) {
                data[i] *= 2;
            }
        }
//#START STATIC

        // Inhalt des Feldes ausgeben
        for (int i = 0; i < data.length; i++) {
            System.out.print(data[i] + ", ");
        }
    }
}
