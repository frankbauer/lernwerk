class MainOverride {
    // Führt das Programm aus, gibt eine Auswertung aus und schickt das Ergebnis an den Playground
    public static void main(String[] args) {
        Shutdown.main(args);
        int reduced = 0;
        int max = Shutdown.getMaxPowerProduced();
        int needed = Shutdown.getPowerNeeded(args);
        String json = "{\"max\":" + max + ",\"needed\":" + needed + ",\"off\":[";
        System.out.println("..........Maximale Leistung: " + max + " MW");
        System.out.println(".........Leistung benötigt: " + needed + " MW");
        System.out.println(".......Leistungsüberschuss: " + (max - needed) + " MW");
        System.out.println();
        System.out.print("...Abgeschaltete Kraftwerke: ");
        boolean didOutput = false;
        boolean first = true;
        int count = 0;
        for (int i = 0; i < Shutdown.turnedOff.length; i++) {
            boolean isSame = false;
            for (int j = 0; j < i; j++) {
                if (Shutdown.turnedOff[i] == Shutdown.turnedOff[j]) isSame = true;
            }
            if (!isSame) {
                if (!didOutput) System.out.println();
                didOutput = true;
                count++;
                int power = Shutdown.getSinglePower(Shutdown.turnedOff[i]);
                System.out.println("   - ID " + Shutdown.turnedOff[i] + ", " + power + " MW");
                reduced += power;
                json += (first ? "" : ",") + "{\"id\":" + Shutdown.turnedOff[i] + ",\"power\":" + power + "}";
                first = false;
            }
        }
        if (!didOutput) System.out.println("KEINE");
        int produced = max - reduced;
        System.out.println();
        System.out.println("..Verbleibender Überschuss: " + (produced - needed) + " MW");
        System.out.println(".....Abgeschaltete Leistung: " + reduced + " MW");
        if (count != 3) {
            System.out.println();
            System.out.println("Achtung: Es müssen genau drei verschiedene Kraftwerke abgeschaltet werden!");
        } else if (produced < needed) {
            System.out.println();
            System.out.println("Achtung: Die benötigte Leistung wird unterschritten!");
        }
        json += "],\"reduced\":" + reduced + ",\"produced\":" + produced + "}";
        de.fau.tf.lgdv.CodeBlocks.postResult(json);
    }
}
