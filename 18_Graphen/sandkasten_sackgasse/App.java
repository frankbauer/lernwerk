public class App {
    public static void main(String[] args) {
        Graph<Integer> g = new Graph<>();
        g.add(1); g.add(2); g.add(3); g.add(4);
        g.add(5); g.add(6); g.add(7);

        g.addEdge(1, 2); g.addEdge(2, 3);
        g.addEdge(1, 4); g.addEdge(4, 5); g.addEdge(4, 6);

        System.out.println("Sackgassen: " + MeineSackgassen.zaehle(g));

        // Die Position der Knoten kann durch Drag & Drop 
        // in der Visualisierung veraendert werden
        g.visualize();
    }
}
