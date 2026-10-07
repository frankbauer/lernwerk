public class Nature {
    public static void main(String[] args) {
        // Erstellt ein neues Objekt der Klasse SunnyHill
        SunnyHill hill = new SunnyHill(args);

        // Eine for-Schleife, die viermal durchläuft, um vier Bäume zu pflanzen.
        for (int i = 0; i < 4; i++) {
            // Erstellt ein neues Objekt der Klasse Tree.
            Tree t = new Tree();
            
            // der Baum "t" wird mit der Instanzmethode "plantAtHill(SunnyHill hill)"
            //auf den zuvor erstellten Hügel "hill" gepflanzt
            t.plantAtHill(hill);
        }
    }
}