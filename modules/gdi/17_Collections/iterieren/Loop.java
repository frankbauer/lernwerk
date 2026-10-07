//#START STATIC
import java.util.*;

public class Loop {
    public static void main(String[] args) {
        LinkedList<String> list = new LinkedList<String>(Arrays.asList("Beta", "Varl", "Erend", "Aloy", "Sylens"));

        // 1. mit einer normalen for-Schleife
        System.out.println("for-loop");
//#START STUDENT

//#START SOLUTION
        for (int i = 0; i < list.size(); i++) {
            System.out.print(list.get(i) + " ");
        }
//#START STATIC
        System.out.println();

        // 2. mit einer for-each-Schleife
        System.out.println();
        System.out.println("for-each-loop");
//#START STUDENT

//#START SOLUTION
        for (String s : list) {
            System.out.print(s + " ");
        }
//#START STATIC
        System.out.println();

        // 3. mit der forEach-Methode
        System.out.println();
        System.out.println("forEach method");
        list.stream().forEach(
//#START STUDENT

//#START SOLUTION
            s -> System.out.print(s + " ")
//#START STATIC
        );
        System.out.println();
    }
}
