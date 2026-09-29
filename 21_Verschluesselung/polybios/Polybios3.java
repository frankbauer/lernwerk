//#START STATIC
        final String message = "HAUS";
        int[] encoded = {};

//#START STUDENT

//#START SOLUTION
        // pro Zeichen zwei Einträge (Zeile und Spalte)
        encoded = new int[message.length() * 2];
        for (int i = 0; i < message.length(); i++) {
            char cc = message.charAt(i);
            // Zeichen in der Tabelle suchen
            for (int r = 0; r < table.length; r++) {
                for (int c = 0; c < table[r].length; c++) {
                    if (table[r][c] == cc) {
                        encoded[i * 2] = r;
                        encoded[i * 2 + 1] = c;
                    }
                }
            }
        }
//#START STATIC

        System.out.println("\n\nDecoded: " + decoded);
        System.out.print("Encoded: ");
        for (int i = 0; i < encoded.length; i++) {
            System.out.print(encoded[i] + " ");
            if (i % 2 == 1) System.out.print(" ");
        }
    }

    public static char[][] buildTable(int offset) {
        final char[][] result = new char[7][6];
        final int COUNT = result.length * (result.length > 0 ? result[0].length : 0);
        for (int r = 0; r < result.length; r++) {
            for (int c = 0; c < result[0].length; c++) {
                int idx = (r * result[0].length + c + offset);
                int l = (idx % COUNT) * (int) Math.pow(-1, (idx % 2)) + ((idx % 2) * COUNT);
                if (l == 36) {
                    result[r][c] = ' ';
                } else if (l == 37) {
                    result[r][c] = '-';
                } else if (l == 38) {
                    result[r][c] = ',';
                } else if (l == 39) {
                    result[r][c] = ';';
                } else if (l == 40) {
                    result[r][c] = ':';
                } else if (l == 41) {
                    result[r][c] = '.';
                } else if (l >= 26) {
                    result[r][c] = (char) ('0' + (l - 26));
                } else {
                    result[r][c] = (char) ('A' + l);
                }
            }
        }
        return result;
    }
}
