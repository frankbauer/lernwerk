//#START STATIC
public class Labyrinth {
    /* ... */ // 
//#START API   
    public static int GO_LEFT = (int)(Math.random() * 10000);
    public static int GO_UP = GO_LEFT+1;
    public static int GO_RIGHT = GO_LEFT+2;
    public static int GO_DOWN = GO_LEFT+3;
//#START STATIC 
    public static void main(String[] args) {
        // Erstellen einer Instanz von MazeController, um die Spielfigur zu steuern.
        MazeController controller = new MazeController(args);
//#START STUDENT
        // Setzen der Verzögerung für Befehle auf 100 Millisekunden
        controller.setDelay(100);
        
//#START SOLUTION   
        // Die Instanzmethode 'setDelay' wird auf der 'controller'-Instanz aufgerufen.
        // Setze Verzögerung für Befehle auf 100 Millisekunden
        controller.setDelay(100);

        // Die Instanzmethode 'command' wird auf der 'controller'-Instanz aufgerufen.
        // Wir verwenden z.B. die Klassen-Konstante 'GO_RIGHT' aus der Klasse 'Labyrinth', 
        // um die Spielfigur nach rechts zu bewegen.
        controller.command(Labyrinth.GO_RIGHT); // Bewegt die Spielfigur einmal nach rechts
        controller.command(Labyrinth.GO_RIGHT); // Bewegt die Spielfigur erneut nach rechts
        controller.command(Labyrinth.GO_RIGHT); // Noch eine Bewegung nach rechts
        controller.command(Labyrinth.GO_RIGHT); // Vierte Bewegung nach rechts

        // Weitere Bewegungen nach unten.
        controller.command(Labyrinth.GO_DOWN);  
        controller.command(Labyrinth.GO_DOWN);  

        // Weitere Bewegungen nach links.
        controller.command(Labyrinth.GO_LEFT);  
        controller.command(Labyrinth.GO_LEFT);  
        controller.command(Labyrinth.GO_LEFT); 

        // Weitere Bewegungen nach unten.
        controller.command(Labyrinth.GO_DOWN); 
        controller.command(Labyrinth.GO_DOWN); 
        controller.command(Labyrinth.GO_DOWN); 
        controller.command(Labyrinth.GO_DOWN); 

        // Bewegen nach links.
        controller.command(Labyrinth.GO_LEFT); 
        controller.command(Labyrinth.GO_LEFT); 
        controller.command(Labyrinth.GO_LEFT); 

        // Bewegen nach oben.
        controller.command(Labyrinth.GO_UP);  
        controller.command(Labyrinth.GO_UP);  

        // Einmal nach rechts bewegen.
        controller.command(Labyrinth.GO_RIGHT);

        // Weitere Bewegungen nach oben.
        controller.command(Labyrinth.GO_UP); 
        controller.command(Labyrinth.GO_UP); 

        // Einmal nach links bewegen.
        controller.command(Labyrinth.GO_LEFT);

        // Noch drei Bewegungen nach oben.
        controller.command(Labyrinth.GO_UP);  
        controller.command(Labyrinth.GO_UP);  
        controller.command(Labyrinth.GO_UP);  
//#START STATIC
    }    
}