class FloatingWorld {
    // Sammelt alle Anweisungen und schickt sie am Ende gesammelt an den Playground (cherrygame.js).
    // Format je Anweisung: ["A", "cherry"] Welt zeigen, ["A"] Spieler hinzufügen,
    // ["M", idx, dx] Spieler bewegen, ["R", idx] Spieler löschen
    private static final java.util.ArrayList<String> instructions = new java.util.ArrayList<>();

    public static void show() {
        instructions.add("[\"A\", \"cherry\"]");
    }

    public static void addPlayer() {
        instructions.add("[\"A\"]");
    }

    public static void movePlayerLeft(int playerID) {
        instructions.add("[\"M\", " + playerID + ", -100]");
    }

    public static void movePlayerRight(int playerID) {
        instructions.add("[\"M\", " + playerID + ", 100]");
    }

    public static void removePlayer(int playerID) {
        instructions.add("[\"R\", " + playerID + "]");
    }

    static void submit() {
        de.fau.tf.lgdv.CodeBlocks.postResult(instructions.toString());
    }
}
