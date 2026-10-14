public class TreasureHunt {
    public static void main(String[] args) {
        // Zeigt die Karte der Schatzinsel an.
        TreasureIsland.createMap();

        // Das Schiff legt am Steg an, der Pirat geht an Land.
        TreasureIsland.land();

        // Mit den Klassenattributen NORTH und EAST wird die Richtung angegeben.
        TreasureIsland.walk(TreasureIsland.NORTH, 5);
        TreasureIsland.walk(TreasureIsland.EAST, 3);

        TreasureIsland.dig();
    }
}
