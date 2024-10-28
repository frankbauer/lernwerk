public class Nature {
    public static void main(String[] args) {
        // Erstellt ein neues Objekt der Klasse SunnyHill
        SunnyHill hill = new SunnyHill(args);

        // Eine for-Schleife, die viermal durchläuft, um vier Bäume zu pflanzen.
        for (int i = 0; i < 4; i++) {
            // Erstellt ein neues Objekt der Klasse Tree.
            Tree t = new Tree();
            
            // Ruft die Instanz-Methode plantAtHill auf, um den Baum 
            // am erstellten Hügel zu pflanzen.
            t.plantAtHill(hill);
        }
    }
}