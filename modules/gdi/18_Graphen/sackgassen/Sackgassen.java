//#START STATIC
public class Sackgassen {

    public static int zaehle(Graph<Integer> g) {
//#START STUDENT

        return 0;
//#START SOLUTION
        int anzahl = 0;
        for (Node<Integer> n : g) {
            // keine ausgehende Kante: Sackgasse
            if (n.childNodes().isEmpty()) {
                anzahl++;
            }
        }
        return anzahl;
//#START STATIC
    }

    public static void main(String[] args) {
        Graph<Integer> g = new Graph<>();
        g.add(1); g.add(2); g.add(3); g.add(4);
        g.add(5); g.add(6); g.add(7);

        g.addEdge(1, 2); g.addEdge(2, 3);
        g.addEdge(1, 4); g.addEdge(4, 5); g.addEdge(4, 6);

        System.out.println("Sackgassen: " + Sackgassen.zaehle(g));

        // Die Position der Knoten kann durch Drag & Drop 
        // in der Visualisierung veraendert werden
        g.visualize();
    }
}
