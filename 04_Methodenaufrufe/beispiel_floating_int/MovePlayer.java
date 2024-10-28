public class MovePlayer {
    public static void main(String[] args) {
        // Zeigt die Welt an.
        FloatingWorld.show();

        // Fügt zwei neue Spieler zur FloatingWorld hinzu.
        FloatingWorld.addPlayer();
        FloatingWorld.addPlayer();
              
        //Verschiebt den ersten der beiden Spieler nach links.
        FloatingWorld.movePlayerLeft(0);
    }
}