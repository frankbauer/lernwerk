//#START STATIC
        final int[] secret = {3, 0, 5, 0, 6, 5, 5, 1, 3, 4, 1, 3, 4, 2, 3, 1, 6, 0, 0, 3, 2, 3, 2, 1, 5, 1, 0, 1, 6, 1, 1, 1, 6, 5};
        String decoded = "";

//#START STUDENT

//#START SOLUTION
        // immer zwei Werte bilden ein Zeichen: erst die Zeile, dann die Spalte
        for (int i = 0; i < secret.length - 1; i += 2) {
            int r = secret[i];
            int c = secret[i + 1];
            decoded = decoded + table[r][c];
        }
