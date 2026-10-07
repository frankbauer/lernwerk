public class PlayerInstance {
    public static void main(String[] args) {
       // Zeigt die FloatingWorld an.
       FloatingWorld.show();
        
       // Fügt einen neuen Spieler zur FloatingWorld hinzu und weist diesen der Variablen kara zu.
       Player kara = FloatingWorld.addPlayer();
       
       // Fügt einen weiteren neuen Spieler zur FloatingWorld hinzu und weist diesen der Variablen lee zu.
       Player lee = FloatingWorld.addPlayer();

       // Ruft die Methode moveLeft() auf das von kara referenzierte Objekt auf, um die Spielfigur nach links zu bewegen.
       kara.moveLeft();
    }
}