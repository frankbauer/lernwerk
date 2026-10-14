class TreasureIsland {
    // Himmelsrichtungen für walk(...)
    public static final byte NORTH = 0;
    public static final byte EAST = 1;
    public static final byte SOUTH = 2;
    public static final byte WEST = 3;

    // ~ = Wasser, # = Land
    private static final String[] ISLAND = {
        "~~~~~~~~~~~~~~~~~~~~",
        "~~~~~~~~#####~~~~~~~",
        "~~~~~~##########~~~~",
        "~~~~~############~~~",
        "~~~~~#############~~",
        "~~~~##############~~",
        "~~~~#############~~~",
        "~~~~############~~~~",
        "~~~~~##########~~~~~",
        "~~~~~~#######~~~~~~~",
        "~~~~~~~~~~~~~~~~~~~~",
        "~~~~~~~~~~~~~~~~~~~~",
    };
    // Palmen (P), Felsen (R) und Bodendetails (d), Steg (D) im Wasser vor der Landestelle (Südküste)
    private static final String[] DECORATION = {
        "....................",
        "........P...........",
        ".............P......",
        ".......d.........P..",
        "................P...",
        "..............R.....",
        "..........P.........",
        ".............P......",
        ".....d..............",
        "..........P.........",
        "........D...........",
        "....................",
    };
    private static final int LANDING_COLUMN = 8, LANDING_ROW = 9;
    private static final int SHIP_COLUMN = 8, SHIP_ROW = 11;
    private static final int TREASURE_COLUMN = 11, TREASURE_ROW = 4;
    private static final String[] DIRECTION_NAMES = {"Norden", "Osten", "Süden", "Westen"};

    private static TileMap map;
    private static MapCharacter ship;
    private static MapCharacter pirate;
    private static MapSprite mark;
    private static boolean found;

    /** Zeigt die Schatzinsel mit dem X, das den Schatz markiert. */
    public static void createMap() {
        if (map != null) {
            System.err.println("Die Karte wurde bereits erstellt.");
            return;
        }
        int[][] terrain = new int[ISLAND.length][ISLAND[0].length()];
        int[][] decorations = new int[ISLAND.length][ISLAND[0].length()];
        for (int r = 0; r < ISLAND.length; r++) {
            for (int c = 0; c < ISLAND[r].length(); c++) {
                terrain[r][c] = ISLAND[r].charAt(c) == '#' ? Terrain.LAND : Terrain.WATER;
                decorations[r][c] = decoration(DECORATION[r].charAt(c), c, r);
            }
        }
        map = new TileMap(Theme.BEACH, terrain);
        map.setDecorations(decorations);
        map.showCoordinates(true);
        mark = new MapSprite(map, SpriteType.TREASURE_X, TREASURE_COLUMN, TREASURE_ROW);
    }

    private static int decoration(char ch, int c, int r) {
        if (ch == 'P') return (c + r) % 2 == 0 ? Decoration.TREE_1 : Decoration.TREE_2;
        if (ch == 'R') return Decoration.ROCKS_1;
        if (ch == 'd') return Decoration.GROUND_DETAIL_1;
        if (ch == 'D') return Decoration.DOCK_2;
        return Decoration.NONE;
    }

    /** Das Schiff segelt von Westen an den Steg an der Südküste, der Pirat geht an Land. */
    public static void land() {
        if (!needsMap()) {
            return;
        }
        if (pirate != null) {
            System.err.println("Der Pirat ist bereits an Land.");
            return;
        }
        ship = new MapCharacter(map, CharacterType.SHIP, 0, SHIP_ROW);
        ship.move(Direction.E, SHIP_COLUMN);
        ship.waitUntilIdle();
        pirate = new MapCharacter(map, CharacterType.HERO, LANDING_COLUMN, LANDING_ROW);
        pirate.face(Direction.N);
        pirate.waitUntilIdle();
    }

    /** Der Pirat läuft steps Felder in die Himmelsrichtung direction (NORTH, EAST, SOUTH oder WEST). */
    public static void walk(byte direction, int steps) {
        if (!needsPirate()) {
            return;
        }
        if (direction < NORTH || direction > WEST) {
            System.err.println("Unbekannte Richtung: " + direction + " (erlaubt sind NORTH, EAST, SOUTH und WEST)");
            return;
        }
        if (steps < 0) {
            System.err.println("Die Anzahl der Schritte darf nicht negativ sein: " + steps);
            return;
        }
        Direction dir = direction == NORTH ? Direction.N : direction == EAST ? Direction.E
                : direction == SOUTH ? Direction.S : Direction.W;
        int done = pirate.move(dir, steps);
        pirate.waitUntilIdle();
        if (done < steps) {
            System.out.println("Nach " + done + " Schritten nach " + DIRECTION_NAMES[direction]
                    + " steht der Pirat am Wasser und bleibt stehen.");
        }
    }

    /** Der Pirat gräbt an seiner aktuellen Position. Steht er auf dem X, findet er den Schatz. */
    public static void dig() {
        if (!needsPirate()) {
            return;
        }
        pirate.waitUntilIdle();
        int c = pirate.getColumn(), r = pirate.getRow();
        pirate.face(Direction.S);
        pirate.pause(0.6);
        pirate.waitUntilIdle();
        if (c == TREASURE_COLUMN && r == TREASURE_ROW && !found) {
            found = true;
            mark.remove();
            // die Truhe springt aus dem Boden in das Feld über dem Piraten
            MapSprite chest = new MapSprite(map, SpriteType.TREASURE_CHEST, c, r);
            chest.moveTo(c, r - 1, 0.35);
            map.sunRay(c, r - 1);
            System.out.println("Schatz gefunden!");
        } else if (found && c == TREASURE_COLUMN && r == TREASURE_ROW) {
            System.out.println("Der Schatz ist schon ausgegraben.");
        } else {
            map.flashCell(c, r);
            System.out.println("Hier ist kein Schatz (" + c + ", " + r + ").");
        }
    }

    private static boolean needsMap() {
        if (map == null) {
            System.err.println("Zuerst muss mit TreasureIsland.createMap() die Karte erstellt werden.");
            return false;
        }
        return true;
    }

    private static boolean needsPirate() {
        if (!needsMap()) {
            return false;
        }
        if (pirate == null) {
            System.err.println("Der Pirat ist noch auf dem Schiff: zuerst TreasureIsland.land() aufrufen.");
            return false;
        }
        return true;
    }

    /** Wird von MainOverride nach dem Programm aufgerufen: lässt die Animationen auslaufen und beendet das Programm. */
    static void finish() {
        if (pirate != null) {
            pirate.waitUntilIdle();
        }
        try {
            Thread.sleep(1200);
        } catch (InterruptedException e) {
            // nichts zu tun
        }
        CodeBlocks.exit(0);
    }
}

