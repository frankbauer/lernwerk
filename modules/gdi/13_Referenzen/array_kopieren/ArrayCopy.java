//#START STATIC
public class ArrayCopy {
    public static void main(String[] args) {
//#START STUDENT

//#START SOLUTION
        int[] numbers = {1, 2, 3, 4, 5};
        int[] copy = new int[numbers.length];

        // Werte einzeln kopieren
        for (int i = 0; i < numbers.length; i++) {
            copy[i] = numbers[i];
        }

        // nur die Kopie verdoppeln
        for (int i = 0; i < copy.length; i++) {
            copy[i] *= 2;
        }

        System.out.println("Array 1:");
        for (int i = 0; i < numbers.length; i++) {
            System.out.print(numbers[i] + " ");
        }

        System.out.println();
        System.out.println("Array 2:");
        for (int i = 0; i < copy.length; i++) {
            System.out.print(copy[i] + " ");
        }
//#START STATIC
    }
}
