class FloatingWorld {
    // Sammelt alle Anweisungen und schickt sie am Ende gesammelt an den Playground (cherrygame.js).
    // Format je Anweisung: ["A", "cherry"] Welt zeigen, ["A"] Spieler hinzufügen,
    // ["M", idx, dx] Spieler bewegen, ["R", idx] Spieler löschen
    static final java.util.ArrayList<String> instructions = new java.util.ArrayList<>();
    static final java.util.ArrayList<Player> players = new java.util.ArrayList<>();

    public static void show() {
        instructions.add("[\"A\", \"cherry\"]");
    }

    public static void removePlayer(Player p) {
        int i = p.getID();
        if (i >= 0) {
            players.remove(i);
            instructions.add("[\"R\", " + i + "]");
        }
    }

    static void submit() {
        de.fau.tf.lgdv.CodeBlocks.postResult(instructions.toString());
    }
}
