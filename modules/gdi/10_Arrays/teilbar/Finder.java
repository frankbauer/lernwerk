//#START STATIC
public class Finder {
    public static void main(String[] args) {
        int[] data = {2, 40, 39, 26, 29, 34, 44, 9, 41, 35, 49, 33, 56, 28};
//#START STUDENT

//#START SOLUTION
        int ct = 0;
        for (int i = 4; i < data.length; i++) {
            if (data[i] % 7 == 0) {
                System.out.println(data[i]);
                ct++;
                if (ct >= 2) {
                    break;
                }
            }
        }
//#START STATIC
    }
}
