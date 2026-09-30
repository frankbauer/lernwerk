//#START STATIC
public class Cinema {
    public static void main(String[] args) {
        // 1 = belegt, 0 = frei
        int[][] seats = {
            {1, 1, 1, 1, 1, 1, 1, 1, 1, 1},
            {1, 1, 0, 1, 1, 1, 1, 0, 1, 1},
            {0, 0, 1, 0, 0, 0, 1, 0, 0, 1},
            {1, 0, 0, 1, 1, 1, 1, 0, 0, 1},
            {0, 1, 1, 1, 0, 0, 1, 1, 1, 0},
            {0, 0, 1, 1, 1, 1, 0, 1, 1, 0},
            {0, 0, 1, 0, 1, 1, 0, 1, 1, 1}
        };

        // Saalplan ausgeben
        for (int row = 0; row < seats.length; row++) {
            System.out.print("Reihe " + (row + 1) + ": ");
            for (int seat = 0; seat < seats[row].length; seat++) {
                System.out.print(seats[row][seat] == 1 ? "X " : ". ");
            }
            System.out.println();
        }
//#START STUDENT

//#START SOLUTION
        // Akkumulatoren für den ganzen Saal: vor der äußeren Schleife
        int total = 0;
        int bestRow = 0;
        int bestFree = 0;
        for (int row = 0; row < seats.length; row++) {
            // Akkumulator für eine Reihe: vor der inneren Schleife, startet in jeder Reihe neu
            int free = 0;
            for (int seat = 0; seat < seats[row].length; seat++) {
                if (seats[row][seat] == 0) {
                    free++;
                }
            }
            total += free;
            if (free > bestFree) {
                bestFree = free;
                bestRow = row;
            }
        }
//#START STATIC
        System.out.println();
        System.out.println("Freie Plätze: " + total);
        System.out.println("Die meisten freien Plätze hat Reihe " + (bestRow + 1) + " (" + bestFree + " frei)");
    }
}
