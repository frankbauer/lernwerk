//#START STATIC
public class Wege {

    public static int wege(Integer ziel, Node<Integer> cur) {
//#START STUDENT

        return 0;
//#START SOLUTION
        // Abbruchfall: am Ziel angekommen, das ist genau ein Weg
        if (cur.getPayload().equals(ziel)) {
            return 1;
        }

        // Wege aller Nachfolger aufsummieren
        int anzahl = 0;
        for (Node<Integer> child : cur.childNodes()) {
            anzahl += wege(ziel, child);
        }
        return anzahl;
//#START STATIC
    }

    public static void main(String[] args) {
        Graph<Integer> g = new Graph<>();
        g.add(1); g.add(2); g.add(3); g.add(4);
        g.add(5); g.add(6); g.add(7);

        g.addEdge(1, 2); g.addEdge(1, 3);
        g.addEdge(2, 4); g.addEdge(2, 5);
        g.addEdge(3, 4); g.addEdge(3, 6); g.addEdge(3, 7);
        g.addEdge(4, 5); g.addEdge(4, 6);
        g.addEdge(5, 6);

        System.out.println("Wege von 1: " + Wege.wege(6, g.find(1)));
        System.out.println("Wege von 7: " + Wege.wege(6, g.find(7)));

        // Die Position der Knoten kann durch Drag & Drop 
        // in der Visualisierung veraendert werden
        g.visualize();
    }
}
