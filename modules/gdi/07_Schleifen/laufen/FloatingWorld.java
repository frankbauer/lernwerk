class FloatingWorld {
    // Sammelt alle Anweisungen und schickt sie am Ende gesammelt an den Playground (cherrygame.js)
    static final java.util.ArrayList<String> instructions = new java.util.ArrayList<>();

    public static void show() {
        instructions.add("[\"A\", \"cherry\"]");
        instructions.add("[\"A\", \"pink\"]");
    }

    static void submit() {
        de.fau.tf.lgdv.CodeBlocks.postResult(instructions.toString());
    }
}
