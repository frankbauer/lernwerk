public class Mill {
    public static boolean millFilledRectangle(ServoController c, int x1, int y1, int x2, int y2) {
        // (x1, y1) muss links oben, (x2, y2) rechts unten liegen
        if (x1 > x2 || y1 > y2) {
            return false;
        }
        c.setSpindle(true);
        for (int y = y1; y <= y2; y++) {
            c.moveTo(x1, y);
            c.moveTo(x2, y);
        }
        c.setSpindle(false);
        return true;
    }

    public static void main(String[] args) {
        ServoController c = new ServoController();
        System.out.println(millFilledRectangle(c, 0, 0, 3, 2));
        System.out.println(millFilledRectangle(c, 3, 0, 0, 2));
    }
}
