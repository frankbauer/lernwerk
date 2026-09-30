//#START STATIC
public class Kette {

    public static Integer ende(Node<Integer> cur) {
//#START STUDENT

        return 0;
//#START SOLUTION
        // Abbruchfall: kein Nachfolger, das ist das letzte Glied
        if (cur.childNodes().isEmpty()) {
            return cur.getPayload();
        }
        // sonst beim einzigen Nachfolger weitersuchen
        return ende(cur.childNodes().get(0));
//#START STATIC
    }

    public static void main(String[] args) {
        Graph<Integer> g = new Graph<>();
        g.add(3); g.add(8); g.add(1); g.add(6); g.add(5);

        g.addEdge(3, 8); g.addEdge(8, 1); g.addEdge(1, 6);

        System.out.println("Ende ab 3: " + Kette.ende(g.find(3)));
        System.out.println("Ende ab 5: " + Kette.ende(g.find(5)));

        // Die Position der Knoten kann durch Drag & Drop 
        // in der Visualisierung veraendert werden
        g.visualize();
    }
}
