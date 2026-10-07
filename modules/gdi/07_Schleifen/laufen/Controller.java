class Controller {
    // Der Spieler startet bei 90 und soll exakt bei target ankommen. Schritte nach rechts sind
    // 10 Pixel lang, nach links 15 Pixel.
    private static final int target = 80;
    private static int pos = 90;

    public static boolean isPlayerAtTarget() {
        // Sicherung gegen Endlosschleifen: außerhalb des Spielfelds wird abgebrochen
        if (pos > 500 || pos < -100) return true;
        return pos == target;
    }

    public static boolean isPlayerLeftOfTarget() {
        return pos < target;
    }

    public static boolean isPlayerRightOfTarget() {
        return pos > target;
    }

    public static void movePlayerLeft() {
        pos -= 15;
        FloatingWorld.instructions.add("[\"M\", 0, -15]");
    }

    public static void movePlayerRight() {
        pos += 10;
        FloatingWorld.instructions.add("[\"M\", 0, 10]");
    }
}
