public class PlayerInstance {
    public static void main(String[] args) {
        // Zeigt die FloatingWorld an.
        FloatingWorld.show();

        // Erzeugt zwei neue Player-Objekte (Referenzen in kara und lee).
        Player kara = new Player();
        Player lee = new Player();

        // Fügt die beiden Spieler zur Welt hinzu.
        FloatingWorld.addPlayer(kara);
        FloatingWorld.addPlayer(lee);

        // Instanzmethode: nur kara bewegt sich.
        kara.moveLeft();
    }
}
