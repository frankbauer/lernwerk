public class Nature {
    public static void main(String[] args) {
        // Erstellt einen neuen Pflanzhügel
        SunnyHill hill = new SunnyHill(args);

        // Erstellt einen neuen Gärtner und bewegt ihn zum Hügel
        Gardener gardener = new Gardener();
        gardener.moveToHill(hill);

        // Solange der Gärtner noch Setzlinge hat, pflanze Bäume
        while (gardener.hasSapling()) {
            gardener.plantTree();    
            //System.out.println(gardener.hasSapling());        
        }        
    }
}