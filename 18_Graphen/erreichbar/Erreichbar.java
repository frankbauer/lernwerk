//#START STATIC
import java.util.ArrayList;

public class Erreichbar {

//#START STUDENT
    public static int anzahl(Node<Integer> start) {

        return 0;
    }
//#START SOLUTION
    public static int anzahl(Node<Integer> start) {
        return anzahlRec(start, new ArrayList<Node<Integer>>());
    }

    private static int anzahlRec(Node<Integer> cur, ArrayList<Node<Integer>> visited) {
        // schon besucht: nicht noch einmal zaehlen (und nicht im Kreis laufen)
        if (visited.contains(cur)) {
            return 0;
        }
        visited.add(cur);

        int anzahl = 1;
        for (Node<Integer> child : cur.childNodes()) {
            anzahl += anzahlRec(child, visited);
        }
        return anzahl;
    }
//#START STATIC

    public static void main(String[] args) {
        Graph<Integer> g = new Graph<>();
        g.add(1); g.add(2); g.add(3); g.add(4);
        g.add(5); g.add(6); g.add(7);

        g.addEdge(1, 2); g.addEdge(2, 3); g.addEdge(3, 1);
        g.addEdge(3, 4); g.addEdge(4, 5); g.addEdge(5, 3);
        g.addEdge(6, 1);

        System.out.println("Erreichbar von 1: " + Erreichbar.anzahl(g.find(1)));
        System.out.println("Erreichbar von 6: " + Erreichbar.anzahl(g.find(6)));

        // Die Position der Knoten kann durch Drag & Drop 
        // in der Visualisierung veraendert werden
        g.visualize();
    }
}
