//#START STATIC
public class Fold {
    private static void print(short[][] image) {
//#START STUDENT
        for (int y = 0; y < image.length; y++) {
            /* TODO */
        }
        System.out.println("\n--------------------------------------\n");
//#START SOLUTION
        for (int y = 0; y < image.length; y++) {
            for (int x = 0; x < image[y].length; x++) {
                System.out.print(image[y][x] + " ");
            }
            System.out.println();
        }
        System.out.println("\n--------------------------------------\n");
//#START STATIC
    }

    public static void main(String[] args) {
        short[][] img = {
            {50, 30, 20, 10, 40},
            {10, 30, 20, 25, 10},
            {40, 30, 50, 20, 40},
            {35, 40, 0, 30, 15}
        };

        double[][] kernel = {
            {1, 0, -1},
            {2, 0, -2},
            {1, 0, -1}
        };

        print(img);
        img = fold(img, kernel);
        print(img);
    }

    private static short[][] fold(short[][] image, double[][] kernel) {
        short[][] result = new short[image.length][image[0].length];
        for (int y = 1; y < image.length - 1; y++) {
            for (int x = 1; x < image[y].length - 1; x++) {
                result[y][x] = fold(x, y, image, kernel);
            }
        }
        return result;
    }

    private static short fold(int x, int y, short[][] image, double[][] kernel) {
//#START STUDENT
        if (kernel.length != 3 || kernel[0].length != 3) {
            return -1;
        }

        double result = 0;

        /* TODO */

        return (short) Math.round(result);
//#START SOLUTION
        if (kernel.length != 3 || kernel[0].length != 3) {
            return -1;
        }

        double result = 0;

        // Filterkernel über die 3x3-Nachbarschaft von (x, y) legen:
        // r und c laufen von -1 bis 1, der Kernel-Index ist daher r + 1 bzw. c + 1
        for (int r = -1; r <= 1; r++) {
            for (int c = -1; c <= 1; c++) {
                result += image[y + r][x + c] * kernel[r + 1][c + 1];
            }
        }

        return (short) Math.round(result);
//#START STATIC
    }
}
