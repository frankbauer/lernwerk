//#START STATIC
public class Polybios {
    public static void main(String[] args) {
        char[][] table = buildTable(5);

//#START STUDENT

//#START SOLUTION
        // Kopfzeile mit den Spaltennummern
        System.out.print("   ");
        for (int c = 0; c < table[0].length; c++) {
            System.out.print(c + " ");
        }
        System.out.println();

        // jede Zeile beginnt mit ihrer Zeilennummer
        for (int r = 0; r < table.length; r++) {
            System.out.print(r + ": ");
            for (int c = 0; c < table[r].length; c++) {
                System.out.print(table[r][c] + " ");
            }
            System.out.println();
        }
